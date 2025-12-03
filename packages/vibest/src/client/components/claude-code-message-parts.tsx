import { Message, MessageContent } from "@vibe-web/ui/ai-elements/message";
import { Response } from "@vibe-web/ui/ai-elements/response";
import { ClaudeCodeToolUIPart } from "@vibe-web/ui/claude-code/tools";
import { isToolUIPart, type UIDataTypes, type UIMessage } from "ai";
import type { ClaudeCodeTools } from "ai-sdk-agents/claude-code";

export type ClaudeCodeUIMessage = UIMessage<
	undefined,
	UIDataTypes,
	ClaudeCodeTools
>;

export function ClaudeCodeMessageParts({
	message,
}: {
	message: ClaudeCodeUIMessage;
}) {
	return (
		<div className="">
			{message.parts.map((part, index) => {
				if (isToolUIPart(part)) {
					return (
						<ClaudeCodeToolUIPart
							key={part.toolCallId}
							message={message}
							part={part}
						/>
					);
				}

				switch (part.type) {
					case "text": {
						return (
							<Message key={`${message.id}-${index}`} from={message.role}>
								<MessageContent>
									{message.role === "assistant" ? (
										<Response>{part.text}</Response>
									) : (
										<p>{part.text}</p>
									)}
								</MessageContent>
							</Message>
						);
					}
					default:
						return null;
				}
			})}
		</div>
	);
}
