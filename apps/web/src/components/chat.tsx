"use client";

import { orpc } from "@/lib/orpc";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import type { ClaudeCodeMetadata } from "@vibe-web/server-trpc/agents";
import { Action, Actions } from "@vibe-web/ui/ai-elements/actions";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@vibe-web/ui/ai-elements/conversation";
import { Loader } from "@vibe-web/ui/ai-elements/loader";
import { Message, MessageContent } from "@vibe-web/ui/ai-elements/message";
import {
	PromptInput,
	PromptInputModelSelect,
	PromptInputModelSelectContent,
	PromptInputModelSelectItem,
	PromptInputModelSelectTrigger,
	PromptInputModelSelectValue,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@vibe-web/ui/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@vibe-web/ui/ai-elements/reasoning";
import { Response } from "@vibe-web/ui/ai-elements/response";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@vibe-web/ui/ai-elements/sources";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@vibe-web/ui/ai-elements/tool";
import type { UIDataTypes, UIMessage } from "ai";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

const models = [
	{
		name: "Opus",
		value: "anthropic/opus-4.1",
	},
	{
		name: "Sonnet",
		value: "anthropic/sonnet-4",
	},
] as const;

type ClaudeCodeUIMessage = UIMessage<
	ClaudeCodeMetadata,
	UIDataTypes,
	{
		Bash: {
			input: string;
			output: string;
		};
	}
>;

export function Chat() {
	const [input, setInput] = useState("");
	const [model, setModel] = useState<string>(models[0].value);

	const sessionId = useRef<string>("");

	const { messages, sendMessage, status, regenerate } =
		useChat<ClaudeCodeUIMessage>({
			transport: {
				async sendMessages(options) {
					if (!sessionId.current) {
						const result = await orpc.claudeCode.session.create.call();
						sessionId.current = result.sessionId;
					}
					// this should not happen, for type safe
					const event = await orpc.claudeCode.prompt.call(
						{
							sessionId: sessionId.current,
							prompt:
								options.messages
									.at(-1)
									?.parts.filter((e) => e.type === "text")?.[0]?.text || "",
						},
						{ signal: options.abortSignal },
					);
					return eventIteratorToStream(event);
				},
				reconnectToStream() {
					throw new Error("Unsupported yet");
				},
			},
			onToolCall(toolCall) {
				console.log("toolCall", toolCall);
			},
			onFinish(data) {
				console.log(data);
			},
		});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			sendMessage(
				{ text: input },
				{
					body: {
						model: model,
					},
				},
			);
			setInput("");
		}
	};

	console.log("render", structuredClone(messages));

	return (
		<div className="max-w-4xl mx-auto p-2 relative size-full h-screen">
			<div className="flex flex-col h-full">
				<Conversation className="h-full">
					<ConversationContent>
						{messages.map((message) => (
							<div key={message.id}>
								{message.role === "assistant" &&
									message.parts.filter((part) => part.type === "source-url")
										.length > 0 && (
										<Sources>
											<SourcesTrigger
												count={
													message.parts.filter(
														(part) => part.type === "source-url",
													).length
												}
											/>
											{message.parts
												.filter((part) => part.type === "source-url")
												.map((part, i) => (
													<SourcesContent key={`${message.id}-${i}`}>
														<Source
															key={`${message.id}-${i}`}
															href={part.url}
															title={part.url}
														/>
													</SourcesContent>
												))}
										</Sources>
									)}
								{message.parts.map((part, i) => {
									switch (part.type) {
										case "text":
											return (
												<Fragment key={`${message.id}-${i}`}>
													<Message from={message.role}>
														<MessageContent>
															<Response>{part.text}</Response>
														</MessageContent>
													</Message>
													{message.role === "assistant" &&
														i === messages.length - 1 && (
															<Actions className="mt-2">
																<Action
																	onClick={() => regenerate()}
																	label="Retry"
																>
																	<RefreshCcwIcon className="size-3" />
																</Action>
																<Action
																	onClick={() =>
																		navigator.clipboard.writeText(part.text)
																	}
																	label="Copy"
																>
																	<CopyIcon className="size-3" />
																</Action>
															</Actions>
														)}
												</Fragment>
											);
										case "reasoning":
											return (
												<Reasoning
													key={`${message.id}-${i}`}
													className="w-full"
													isStreaming={
														status === "streaming" &&
														i === message.parts.length - 1 &&
														message.id === messages.at(-1)?.id
													}
												>
													<ReasoningTrigger />
													<ReasoningContent>{part.text}</ReasoningContent>
												</Reasoning>
											);
										case "tool-Bash":
											return (
												<Tool defaultOpen={true}>
													<ToolHeader type="tool-Bash" state={part.state} />
													<ToolContent>
														<ToolInput input={part.input} />
														<ToolOutput
															output={<Response>{part.output}</Response>}
															errorText={part.errorText}
														/>
													</ToolContent>
												</Tool>
											);
										default:
											return null;
									}
								})}
							</div>
						))}
						{status === "submitted" && <Loader />}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				<PromptInput onSubmit={handleSubmit} className="mt-4">
					<PromptInputTextarea
						onChange={(e) => setInput(e.target.value)}
						value={input}
					/>
					<PromptInputToolbar>
						<PromptInputTools>
							<PromptInputModelSelect
								onValueChange={(value) => {
									setModel(value);
								}}
								value={model}
							>
								<PromptInputModelSelectTrigger>
									<PromptInputModelSelectValue />
								</PromptInputModelSelectTrigger>
								<PromptInputModelSelectContent>
									{models.map((model) => (
										<PromptInputModelSelectItem
											key={model.value}
											value={model.value}
										>
											{model.name}
										</PromptInputModelSelectItem>
									))}
								</PromptInputModelSelectContent>
							</PromptInputModelSelect>
						</PromptInputTools>
						<PromptInputSubmit disabled={!input} status={status} />
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
}
