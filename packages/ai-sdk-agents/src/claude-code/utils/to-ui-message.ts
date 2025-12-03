import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { generateId, type UIMessageChunk } from "ai";

export interface UIMessageMetadata {
	sessionId: string;
}

export type UIMessageDataTypes = {
	system_init: {
		sessionId: string;
	};
};

export async function* toUIMessage(
	iterator: AsyncGenerator<SDKMessage, void, unknown>,
): AsyncGenerator<UIMessageChunk<UIMessageMetadata, UIMessageDataTypes>> {
	for await (const message of iterator) {
		switch (message.type) {
			case "system": {
				if (message.subtype === "init") {
					yield {
						type: "start",
						messageMetadata: {
							sessionId: message.session_id,
						},
					};
					yield {
						type: "data-system_init",
						data: {
							sessionId: message.session_id,
						},
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
								providerMetadata: message.parent_tool_use_id
									? {
											claudeCode: {
												parentToolUseId: message.parent_tool_use_id,
											},
										}
									: undefined,
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
								const providerMetadata = message.parent_tool_use_id
									? {
											claudeCode: {
												parentToolUseId: message.parent_tool_use_id,
											},
										}
									: undefined;
								if (part.is_error) {
									yield {
										type: "tool-output-error",
										toolCallId: part.tool_use_id,
										errorText:
											typeof part.content === "string" ? part.content : "",
										providerExecuted: true,
									};
								} else {
									yield {
										type: "tool-output-available",
										toolCallId: part.tool_use_id,
										output: part.content,
										providerExecuted: true,
									};
								}
								break;
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
