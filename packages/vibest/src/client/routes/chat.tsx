import { consumeEventIterator } from "@orpc/client";
import { Button } from "@vibe-web/ui/components/button";
import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { orpcClient, orpcWsClient } from "@/lib/orpc";

export const Route = createFileRoute({
	component: Component,
});

function Component() {
	const [sessionId, setSessionId] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (!sessionId) {
			return;
		}

		const isAbortError = (error: unknown) =>
			error instanceof DOMException && error.name === "AbortError";

		const abortController = new AbortController();
		const unsubscribe = consumeEventIterator(
			orpcWsClient.claudeCode.toolPermission(
				{ sessionId },
				{ signal: abortController.signal },
			),
			{
				onEvent: (event) => {
					console.log("Tool permission request:", event);
				},
				onError: (error) => {
					if (isAbortError(error)) {
						return;
					}
					console.error("Tool permission error:", error);
				},
				onFinish: () => {
					console.log("Tool permission stream finished");
				},
			},
		);

		return () => {
			abortController.abort();
			void unsubscribe().catch((error) => {
				if (isAbortError(error)) {
					return;
				}
				console.error(
					"Failed to unsubscribe from tool permission stream",
					error,
				);
			});
		};
	}, [sessionId]);

	const handleNewSession = async () => {
		try {
			// Abort current session to prevent leaks; multi-session not supported yet
			if (sessionId) {
				await orpcClient.claudeCode.session.abort({
					sessionId: sessionId,
				});
				setSessionId(undefined);
			}

			const { sessionId: newSessionId } =
				await orpcClient.claudeCode.session.create();
			setSessionId(newSessionId);
		} catch (error) {
			console.error("Failed to start a new session", error);
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between p-2 border-b bg-background">
				<Button
					size="sm"
					className="ml-auto"
					variant="outline"
					onClick={handleNewSession}
				>
					New Session
				</Button>
			</div>
			<Chat
				className="w-full min-w-80 max-w-4xl mx-auto"
				sessionId={sessionId}
				onSessionIdChange={setSessionId}
			/>
		</div>
	);
}
