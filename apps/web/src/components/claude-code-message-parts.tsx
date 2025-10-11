import { Message, MessageContent } from "@vibe-web/ui/ai-elements/message";
import { Response } from "@vibe-web/ui/ai-elements/response";
import { ClaudeCodeToolUIPart } from "@vibe-web/ui/claude-code/tools";
import { Badge } from "@vibe-web/ui/components/badge";
import { isToolUIPart, type UIMessage } from "ai";
import type { ClaudeCodeTools } from "ai-sdk-agents/claude-code";

export type ClaudeCodeUIInspectorData = {
	file?: string;
	line?: number;
	column?: number;
	component?: string;
};

export type ClaudeCodeUIDataTypes = {
	inspector: ClaudeCodeUIInspectorData[];
};

export type ClaudeCodeUIMessage = UIMessage<
	undefined,
	ClaudeCodeUIDataTypes,
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
					case "data-inspector": {
						return (
							<Message
								className="pb-0"
								key={`${message.id}-${index}`}
								from={message.role}
							>
								<div className="flex flex-wrap gap-2">
									{part.data.map((inspector) => (
										<Badge key={inspector.file}>{inspector.component}</Badge>
									))}
								</div>
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
