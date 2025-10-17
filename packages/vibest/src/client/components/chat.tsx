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
import { useEffect, useRef, useState } from "react";
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

export function Chat({
	className,
	sessionId,
	onSessionIdChange,
}: {
	className?: string;
	sessionId: string | undefined;
	onSessionIdChange: (sessionId: string) => void;
}) {
	const [input, setInput] = useState("");
	const [model, setModel] = useState<"opus" | "sonnet">("sonnet");
	const sessionIdRef = useRef<string | undefined>(undefined);

	// 同步 sessionId 到 ref，避免闭包问题
	useEffect(() => {
		sessionIdRef.current = sessionId;
	}, [sessionId]);

	const { messages, sendMessage, status } = useChat<ClaudeCodeUIMessage>({
		transport: {
			async sendMessages(options) {
				try {
					// 使用 ref 获取最新的 sessionId
					const currentSessionId = sessionIdRef.current;
					if (!currentSessionId) {
						throw new Error("Session not initialized");
					}
					const message = options.messages.at(-1);
					if (!message) {
						throw new Error("message is required");
					}
					const event = await orpcClient.claudeCode.prompt(
						{ sessionId: currentSessionId, message },
						{ signal: options.abortSignal },
					);
					return eventIteratorToStream(event);
				} catch (error) {
					console.error("Failed to send messages", error);
					throw error;
				}
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

		// 确保 session 已经创建
		if (!sessionId) {
			console.warn("Session not ready yet");
			return;
		}

		sendMessage({
			parts: [{ type: "text", text: input }],
		});

		setInput("");
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
						<PromptInputSubmit disabled={!input || !sessionId} status={status} />
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
}
