import { Message, MessageContent } from "@vibe-web/ui/ai-elements/message";
import { Badge } from "@vibe-web/ui/components/badge";
import ReactMarkdown from "react-markdown";
import type { ClaudeCodeUIMessage } from "@/types";
import {
	ClaudeCodeBashTool,
	ClaudeCodeEditTool,
	ClaudeCodeGrepTool,
	ClaudeCodeReadTool,
	ClaudeCodeTaskTool,
} from "./claude-code-tool";

export function MessageParts({ message }: { message: ClaudeCodeUIMessage }) {
	return (
		<div className="text-sm">
			{message.parts.map((part, i) => {
				switch (part.type) {
					case "text": {
						return (
							<Message key={`${message.id}-${i}`} from={message.role}>
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
								key={`${message.id}-${i}`}
								from={message.role}
							>
								<div
									className="flex flex-wrap gap-2"
									key={`${message.id}-${i}`}
								>
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
