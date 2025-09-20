import { client, orpc } from "@/lib/orpc";
import {
	PromptInput,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
} from "@vibe-web/ui/ai-elements/prompt-input";
import { Button } from "@vibe-web/ui/components/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute({
	component: HomeComponent,
});

function HomeComponent() {
	const [input, setInput] = useState("");

	const [sessionId, setSessionId] = useState<string>();
	const [messages, setMessages] = useState<any[]>([]);

	const handleNewSession = async () => {
		const { sessionId } = await orpc.claudeCode.session.create.call();
		setSessionId(sessionId);
		console.log(sessionId);
	};

	useEffect(() => {
		async function sub() {
			if (!sessionId) return;
		}

		sub();
	}, [sessionId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim() && sessionId !== undefined) {
			const controller = new AbortController();
			// client.claudeCode
			//   .prompt({
			//     sessionId,
			//     prompt: input,
			//   })
			//   .finally(() => {
			//     // Abort the subscription stream once the prompt resolves
			//     controller.abort()
			//   })

			const prompt = input;
			// Clear input immediately
			setInput("");

			try {
				for await (const message of await orpc.claudeCode.subscribe.call(
					{ prompt, sessionId },
					{ signal: controller.signal },
				)) {
					setMessages((prev) => [...prev, message]);
				}
			} catch (error: unknown) {
				if (error instanceof Error && error.name !== "AbortError") {
					console.error(error);
				}
			}
		}
	};

	return (
		<div>
			<Button onClick={handleNewSession}>new session</Button>
			{messages.map((msg, index) => (
				<div key={index} style={{ whiteSpace: "pre-wrap" }}>
					<p>{JSON.stringify(msg, null, 2)}</p>
				</div>
			))}
			<PromptInput onSubmit={handleSubmit} className="mt-4">
				<PromptInputTextarea
					onChange={(e) => setInput(e.target.value)}
					value={input}
				/>
				<PromptInputToolbar>
					<PromptInputSubmit disabled={!input} />
				</PromptInputToolbar>
			</PromptInput>
		</div>
	);

	return <Chat />;
}
