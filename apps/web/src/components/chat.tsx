import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@vibe-web/ui/ai-elements/conversation";
import { Loader } from "@vibe-web/ui/ai-elements/loader";
import {
	PromptInput,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@vibe-web/ui/ai-elements/prompt-input";
import {
	createListCollection,
	Select,
	SelectContent,
	SelectControl,
	SelectItem,
	SelectTrigger,
	SelectValueText,
} from "@vibe-web/ui/components/select";
import { cn } from "@vibe-web/ui/lib/utils";
import { useRef, useState } from "react";
import { MessageParts } from "@/components/message-parts";
import { orpcClient } from "@/lib/orpc";
import type { ClaudeCodeUIMessage } from "@/types";

const models = createListCollection<{
	label: "Opus" | "Sonnet";
	value: "opus" | "sonnet";
}>({
	items: [
		{
			label: "Opus",
			value: "opus",
		},
		{
			label: "Sonnet",
			value: "sonnet",
		},
	],
});

export function Chat({ className }: { className?: string }) {
	const [input, setInput] = useState("");
	const [model, setModel] = useState<"opus" | "sonnet">("sonnet");
	const sessionId = useRef<string>(undefined);

	const { messages, sendMessage, status } = useChat<ClaudeCodeUIMessage>({
		transport: {
			async sendMessages(options) {
				if (!sessionId.current) {
					const result = await orpcClient.claudeCode.session.create();
					sessionId.current = result.sessionId;
				}
				const message = options.messages.at(-1);
				if (!message) {
					throw new Error("message is required");
				}
				const event = await orpcClient.claudeCode.prompt(
					{ sessionId: sessionId.current, message },
					{ signal: options.abortSignal },
				);
				return eventIteratorToStream(event);
			},
			reconnectToStream() {
				throw new Error("Unsupported yet");
			},
		},
		onFinish: ({ messages }) => {
			console.log("onFinish", messages);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!input.trim()) return;

		sendMessage({
			parts: [{ type: "text", text: input }],
		});

		setInput("");
	};

	const _handleNewSession = async () => {
		try {
			// Abort current session to prevent leaks; multi-session not supported yet
			if (sessionId.current) {
				await orpcClient.claudeCode.session.abort({
					sessionId: sessionId.current,
				});
				sessionId.current = undefined;
			}

			const { sessionId: newSessionId } =
				await orpcClient.claudeCode.session.create();
			sessionId.current = newSessionId;
		} catch (error) {
			console.error("Failed to start a new session", error);
		}
	};

	return (
		<div className={cn("flex flex-col flex-1 min-h-0", className)}>
			<Conversation>
				<ConversationContent>
					{messages.map((message) => (
						<MessageParts key={message.id} message={message} />
					))}
					{status === "submitted" && <Loader />}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>
			<div className="flex-shrink-0 p-2">
				<PromptInput onSubmit={handleSubmit}>
					<PromptInputTextarea
						className="min-h-4"
						onChange={(e) => setInput(e.target.value)}
						value={input}
						placeholder="Ask Claude Code anything..."
					/>
					<PromptInputToolbar>
						<PromptInputTools>
							<Select
								className="relative"
								collection={models}
								value={[model]}
								onValueChange={(details) => {
									setModel(details.value[0] as "opus" | "sonnet");
								}}
							>
								<SelectControl className="min-h-8">
									<SelectTrigger className="py-0">
										<SelectValueText />
									</SelectTrigger>
								</SelectControl>
								<SelectContent>
									{models.items.map((model) => (
										<SelectItem key={model.value} item={model}>
											{model.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</PromptInputTools>
						<PromptInputSubmit disabled={!input} status={status} />
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
}
