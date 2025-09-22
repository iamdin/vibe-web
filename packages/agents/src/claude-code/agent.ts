import {
	type Options,
	type Query,
	query,
	type SDKMessage,
	type SDKUserMessage,
} from "@anthropic-ai/claude-code";
import { generateId, type InferUIMessageChunk, type UIMessage } from "ai";
import {
	type Pushable,
	queuelessPushable as pushable,
} from "it-queueless-pushable";
import type { ClaudeCodeMetadata } from "./types";

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
		const input = pushable<SDKUserMessage>();

		const options: Options = {
			mcpServers: {},
			// permissionPromptToolName: toolNames.permission,
			stderr: (err) => console.error(err),
			// note: although not documented by the types, passing an absolute path
			executable: process.execPath as "node",
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

	static async *toUIMessage(
		iterator: AsyncGenerator<SDKMessage, void, unknown>,
	): AsyncGenerator<InferUIMessageChunk<UIMessage<ClaudeCodeMetadata>>> {
		for await (const message of iterator) {
			switch (message.type) {
				case "system": {
					if (message.subtype === "init") {
						yield {
							type: "start",
						};
					}
					break;
				}
				case "assistant":
					for (const part of message.message.content) {
						switch (part.type) {
							case "text": {
								yield {
									type: "text-start",
									id: message.message.id,
								};
								yield {
									type: "text-delta",
									id: message.message.id,
									delta: part.text,
								};
								yield {
									type: "text-end",
									id: message.message.id,
								};
								break;
							}
							case "tool_use": {
								yield {
									type: "tool-input-available",
									toolCallId: part.id,
									toolName: part.name,
									input: part.input,
									providerExecuted: true,
								};
								break;
							}
							default: {
								break;
							}
						}
					}
					break;
				case "user":
					if (typeof message.message.content === "string") {
						const id = generateId();
						yield {
							type: "text-start",
							id,
						};
						yield {
							type: "text-delta",
							id,
							delta: message.message.content,
						};
						yield {
							type: "text-end",
							id,
						};
					} else {
						for (const part of message.message.content) {
							switch (part.type) {
								case "tool_result": {
									yield {
										type: "tool-output-available",
										toolCallId: part.tool_use_id,
										output: part.content,
										providerExecuted: true,
									};
								}
							}
						}
					}
					break;
				case "result":
					if (message.subtype === "success") {
						yield {
							type: "finish",
						};
					}
					break;
			}
		}
	}
}
