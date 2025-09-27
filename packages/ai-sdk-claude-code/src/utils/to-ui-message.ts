import type { SDKMessage } from "@anthropic-ai/claude-code";
import { generateId, type InferUIMessageChunk, type UIMessage } from "ai";

export async function* toUIMessage<T extends UIMessage>(
	iterator: AsyncGenerator<SDKMessage, void, unknown>,
): AsyncGenerator<InferUIMessageChunk<T>> {
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
								providerMetadata: {
									claudeCode: {
										parentToolUseId: message.parent_tool_use_id,
									},
								},
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
									providerMetadata: {
										claudeCode: {
											parentToolUseId: message.parent_tool_use_id,
										},
									},
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
