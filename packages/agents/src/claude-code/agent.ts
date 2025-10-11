import {
	type Options,
	type Query,
	query,
	type SDKMessage,
	type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { generateId } from "ai";
import { Pushable } from "./utils/pushable";

interface SessionState {
	/**
	 * the claude code session, will set when first system message is received
	 */
	id?: string;
	query: Query;
	input: Pushable<SDKUserMessage>;
	permissionMode: string;
}

export class Session {
	private store = new Map<string, SessionState>();

	get(id: string) {
		const session = this.store.get(id);
		if (!session) {
			throw new Error("session not found");
		}
		return session;
	}

	list() {
		return Array.from(this.store.values());
	}

	create() {
		const sessionId = generateId();
		const input = new Pushable<SDKUserMessage>();

		const options: Options = {
			mcpServers: {},
			strictMcpConfig: true,
			// permissionPromptToolName: toolNames.permission,
			stderr: (err) => console.error(err),
			// note: although not documented by the types, passing an absolute path
			executable: process.execPath as "node",
			// Maintain Claude Code behavior with preset system prompt
			systemPrompt: { type: "preset", preset: "claude_code" },
			// Load filesystem settings for project-level configuration
			settingSources: ["user", "project", "local"],
		};

		const q = query({
			prompt: input,
			options,
		});

		this.store.set(sessionId, {
			query: q,
			input,
			permissionMode: "default",
		});

		return { sessionId };
	}

	abort(sessionId: string) {
		const session = this.get(sessionId);
		session.input.end();
		session.query.interrupt();
		this.store.delete(sessionId);
	}

	interrupt(sessionId: string) {
		const session = this.get(sessionId);
		session.query.interrupt();
	}

	async *prompt(input: {
		sessionId: string;
		message: SDKUserMessage["message"];
	}): AsyncGenerator<SDKMessage, void, unknown> {
		const session = this.get(input.sessionId);
		session.input.push({
			type: "user",
			message: input.message,
			parent_tool_use_id: null,
			session_id: input.sessionId,
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
}

export class ClaudeCodeAgent {
	session = new Session();
}
