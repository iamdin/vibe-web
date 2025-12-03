import type * as sdk from "@anthropic-ai/claude-agent-sdk";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { error } from "console";
import invariant from "tiny-invariant";
import { v7 as uuid } from "uuid";
import type { ToolPermissionRequest } from "./types";
import { Pushable } from "./utils/pushable";

interface SessionInfo {
	/**
	 * the current public identifier for the claude code session
	 */
	id?: string;
	query: sdk.Query;
	input: Pushable<sdk.SDKUserMessage>;
	requestPermission: Pushable<ToolPermissionRequest>;
	pendingPermissionRequests: Map<string, PendingToolPermission>;
}

type PendingToolPermission = (result: sdk.PermissionResult) => void;

export class Session {
	private store: SessionInfo[] = [];

	get(id: string) {
		const session = this.store.find((session) => session.id === id);
		invariant(session, "session not found");
		return session;
	}

	list() {
		return [...this.store];
	}

	async create(): Promise<SessionInfo> {
		// if these already exist a uninitialized session, don't create a new one
		const uninitializedSession = this.store.find((session) => !!session.id);
		if (uninitializedSession) return uninitializedSession;

		const input = new Pushable<sdk.SDKUserMessage>();
		const requestPermission = new Pushable<ToolPermissionRequest>();

		const record: SessionInfo = {
			// initial no session id
			query: null as unknown as sdk.Query,
			input,
			requestPermission,
			pendingPermissionRequests: new Map(),
		};

		const options: sdk.Options = {
			mcpServers: {},
			strictMcpConfig: true,
			stderr: (data) => console.log(data),
			// note: although not documented by the types, passing an absolute path
			executable: process.execPath as "node",
			// Maintain Claude Code behavior with preset system prompt
			systemPrompt: { type: "preset", preset: "claude_code" },
			// Load filesystem settings for project-level configuration
			settingSources: ["user", "project", "local"],
			// canUseTool callback: push permission requests to output stream
			canUseTool: async (toolName, input, { signal, suggestions }) => {
				const requestId = uuid();
				const pendingPermissionRequests = record.pendingPermissionRequests;
				let resolve: (result: sdk.PermissionResult) => void;
				const promise = new Promise<sdk.PermissionResult>((_resolve) => {
					resolve = _resolve;
				});

				const pendingPermission: PendingToolPermission = (
					result: sdk.PermissionResult,
				) => {
					resolve(result);
					cleanUp();
				};

				function cleanUp() {
					pendingPermissionRequests.delete(requestId);
					signal.removeEventListener("abort", abortHandler);
				}

				function abortHandler() {
					resolve({
						behavior: "deny",
						message: `Tool permission for ${toolName} was aborted`,
						interrupt: true,
					});
					cleanUp();
				}

				signal.addEventListener("abort", abortHandler, { once: true });

				pendingPermissionRequests.set(requestId, pendingPermission);

				invariant(record.id, "session id not set");
				// Push permission request to output stream (only necessary fields)
				requestPermission.push({
					type: "tool-permission-request",
					sessionId: record.id,
					requestId,
					toolName,
					input,
					suggestions,
				});

				return promise;
			},
		};

		record.query = query({
			prompt: input,
			options,
		});

		this.store.push(record);

		return record;
	}

	async getSupportedCommands(sessionId: string): Promise<sdk.SlashCommand[]> {
		const session = this.get(sessionId);
		return session.query.supportedCommands();
	}

	async getSupportedModels(sessionId: string): Promise<sdk.ModelInfo[]> {
		const session = this.get(sessionId);
		return session.query.supportedModels();
	}

	async getMcpServers(sessionId: string): Promise<sdk.McpServerStatus[]> {
		const session = this.get(sessionId);
		return session.query.mcpServerStatus();
	}

	abort(sessionId: string) {
		const session = this.get(sessionId);

		for (const resolve of session.pendingPermissionRequests.values()) {
			resolve({
				behavior: "deny",
				message: "Request aborted due to session termination",
				interrupt: true,
			});
		}
		session.requestPermission.end();
		session.pendingPermissionRequests.clear();

		session.input.end();
		session.query.interrupt();

		const index = this.store.indexOf(session);
		if (index !== -1) {
			this.store.splice(index, 1);
		}
	}

	interrupt(sessionId: string) {
		const session = this.get(sessionId);
		session.query.interrupt();
	}

	async *prompt(input: {
		sessionId?: string;
		message: sdk.SDKUserMessage["message"];
		model?: string;
		maxThinkingTokens?: number;
		mode?: sdk.PermissionMode;
	}): AsyncGenerator<sdk.SDKMessage, void, unknown> {
		console.log("prompt", input);
		const session = !input.sessionId
			? await this.create()
			: this.get(input.sessionId);

		if (input?.model) {
			await session.query.setModel(input.model);
		}
		if (input?.maxThinkingTokens) {
			await session.query.setMaxThinkingTokens(input.maxThinkingTokens);
		}
		if (input?.mode) {
			await session.query.setPermissionMode(input.mode);
		}

		session.input.push({
			type: "user",
			message: input.message,
			parent_tool_use_id: null,
			// @ts-expect-error first message, the session id can be undefined
			session_id: session.id,
		});

		while (true) {
			const { value: message, done } = await session.query.next();

			if (done || !message) {
				return;
			}
			switch (message.type) {
				case "system": {
					if (message.subtype === "init") {
						session.id = message.session_id;
					}
					yield message;
					break;
				}
				case "result": {
					yield message;
					return;
				}
				default: {
					yield message;
					break;
				}
			}
		}
	}

	respondPermission(
		sessionId: string,
		requestId: string,
		result: sdk.PermissionResult,
	) {
		const session = this.get(sessionId);
		const request = session.pendingPermissionRequests.get(requestId);
		if (!request) {
			throw new Error(`Pending tool permission request ${requestId} not found`);
		}
		request(result);
		return true;
	}
}

export class ClaudeCodeAgent {
	session = new Session();
}
