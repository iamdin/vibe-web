import { consumeEventIterator } from "@orpc/client";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@vibe-web/ui/components/button";
import { useEffect, useEffectEvent, useState } from "react";
import { Chat } from "@/components/chat";
import { orpcWsClient } from "@/lib/orpc";

export const Route = createFileRoute({
	component: Component,
});

function Component() {
	const { sessionId } = Route.useParams();
	return <ChatRouteView initialSessionId={sessionId} />;
}

export function ChatRouteView({
	initialSessionId,
}: {
	initialSessionId?: string;
}) {
	const navigate = useNavigate();
	const [sessionId, setSessionId] = useState<string | undefined>(
		initialSessionId,
	);

	useEffect(() => {
		const isAbortError = (error: unknown) =>
			error instanceof DOMException && error.name === "AbortError";

		if (!sessionId) {
			return;
		}

		const abortController = new AbortController();
		const unsubscribe = consumeEventIterator(
			orpcWsClient.claudeCode.requestPermission(
				{ sessionId },
				{ signal: abortController.signal },
			),
			{
				onEvent: async (event) => {
					console.log("Tool permission request:", event);

					const currentSessionId = sessionIdRef.current;
					if (!currentSessionId) {
						console.error("Session ID not found");
						return;
					}

					const message = `Tool Permission Request:\n\nTool: ${event.toolName}\nRequest ID: ${event.requestId}\n\nInput: ${JSON.stringify(event.input, null, 2)}\n\nAllow this tool to execute?`;

					const userConfirmed = window.confirm(message);

					try {
						if (userConfirmed) {
							await orpcWsClient.claudeCode.respondPermission({
								sessionId: currentSessionId,
								requestId: event.requestId,
								result: {
									behavior: "allow",
									updatedInput: event.input,
								},
							});
						} else {
							await orpcWsClient.claudeCode.respondPermission({
								sessionId: currentSessionId,
								requestId: event.requestId,
								result: {
									behavior: "deny",
									message: "User denied the permission request",
									interrupt: true,
								},
							});
						}
					} catch (error) {
						console.error("Failed to respond to permission request:", error);
					}
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

	const handleSessionIdUpdate = useEffectEvent((nextSessionId: string) => {
		setSessionId(nextSessionId);
		navigate({
			to: "/chat/{-$sessionId}",
			params: { sessionId: nextSessionId },
			replace: true,
		});
	});

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between p-2 border-b bg-background">
				<Button size="sm" className="ml-auto" variant="outline">
					New Session
				</Button>
			</div>
			<Chat
				key={sessionId ?? "pending"}
				className="w-full min-w-80 max-w-4xl mx-auto"
				sessionId={sessionId}
				onUpdateSessionId={handleSessionIdUpdate}
			/>
		</div>
	);
}
