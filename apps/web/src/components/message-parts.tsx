import { Message, MessageContent } from "@vibe-web/ui/ai-elements/message";
import ReactMarkdown from "react-markdown";
import type { ClaudeCodeUIMessage } from "@/types";

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
					default:
						return null;
				}
			})}
		</div>
	);
}
