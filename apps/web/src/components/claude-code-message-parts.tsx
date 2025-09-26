import { Message, MessageContent } from "@vibe-web/ui/ai-elements/message";
import {
	ClaudeCodeBashTool,
	ClaudeCodeEditTool,
	ClaudeCodeGrepTool,
	ClaudeCodeReadTool,
	ClaudeCodeTaskTool,
} from "@vibe-web/ui/claude-code/tools";
import { Badge } from "@vibe-web/ui/components/badge";
import type { UIMessage } from "ai";
import type { ClaudeCodeTools } from "ai-sdk-claude-code";
import ReactMarkdown from "react-markdown";

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
		<div className="text-sm">
			{message.parts.map((part, index) => {
				switch (part.type) {
					case "text": {
						return (
							<Message key={`${message.id}-${index}`} from={message.role}>
								<MessageContent>
									{message.role === "assistant" ? (
										<ReactMarkdown>{part.text}</ReactMarkdown>
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
					case "tool-Bash":
						return (
							<ClaudeCodeBashTool key={part.toolCallId} invocation={part} />
						);
					case "tool-Read":
						return (
							<ClaudeCodeReadTool key={part.toolCallId} invocation={part} />
						);
					case "tool-Grep":
						return (
							<ClaudeCodeGrepTool key={part.toolCallId} invocation={part} />
						);
					case "tool-Edit":
						return (
							<ClaudeCodeEditTool key={part.toolCallId} invocation={part} />
						);
					case "tool-Task":
						return (
							<ClaudeCodeTaskTool key={part.toolCallId} invocation={part} />
						);
					default:
						return null;
				}
			})}
		</div>
	);
}
