import { consumeEventIterator } from "@orpc/client";
import { Button } from "@vibe-web/ui/components/button";
import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/chat";
import { orpcClient, orpcWsClient } from "@/lib/orpc";

export const Route = createFileRoute({
	component: Component,
});

function Component() {
	const [sessionId, setSessionId] = useState<string | undefined>(undefined);
	const sessionIdRef = useRef<string | undefined>(undefined);
	const isInitializingRef = useRef(false);

	// 同步 sessionId 到 ref，以便在事件处理器中使用最新值
	useEffect(() => {
		sessionIdRef.current = sessionId;
	}, [sessionId]);

	// 组件挂载时自动创建 session
	useEffect(() => {
		const initSession = async () => {
			// 防止重复创建
			if (isInitializingRef.current || sessionId) {
				return
			}

			isInitializingRef.current = true;
			try {
				const { sessionId: newSessionId } =
					await orpcClient.claudeCode.session.create();
				console.log("Initial session created:", newSessionId);
				setSessionId(newSessionId);
			} catch (error) {
				console.error("Failed to create initial session", error);
			} finally {
				isInitializingRef.current = false;
			}
		}

		initSession();
	}, []);

	useEffect(() => {
		if (!sessionId) {
			return
		}

		const isAbortError = (error: unknown) =>
			error instanceof DOMException && error.name === "AbortError";

		const abortController = new AbortController();
		const unsubscribe = consumeEventIterator(
			orpcWsClient.claudeCode.requestPermission(
				{ sessionId },
				{ signal: abortController.signal },
			),
			{
				onEvent: async (event) => {
					console.log("Tool permission request:", event);

					// 使用 ref 获取最新的 sessionId
					const currentSessionId = sessionIdRef.current;
					if (!currentSessionId) {
						console.error("Session ID not found");
						return
					}

					// 使用浏览器原生 confirm 弹窗展示权限请求
					const message = `Tool Permission Request:\n\nTool: ${event.toolName}\nRequest ID: ${event.requestId}\n\nInput: ${JSON.stringify(event.input, null, 2)}\n\nAllow this tool to execute?`;

					const userConfirmed = window.confirm(message);

					// 响应权限请求
					try {
						if (userConfirmed) {
							await orpcWsClient.claudeCode.respondPermission({
								sessionId: currentSessionId,
								requestId: event.requestId,
								result: {
									behavior: "allow",
									updatedInput: event.input
								},
							})
						} else {
							await orpcWsClient.claudeCode.respondPermission({
								sessionId: currentSessionId,
								requestId: event.requestId,
								result: {
									behavior: "deny",
									message: "User denied the permission request",
									interrupt: true,
								},
							})
						}
					} catch (error) {
						console.error("Failed to respond to permission request:", error);
					}
				},
				onError: (error) => {
					if (isAbortError(error)) {
						return
					}
					console.error("Tool permission error:", error);
				},
				onFinish: () => {
					console.log("Tool permission stream finished");
				},
			},
		)

		return () => {
			abortController.abort();
			void unsubscribe().catch((error) => {
				if (isAbortError(error)) {
					return
				}
				console.error(
					"Failed to unsubscribe from tool permission stream",
					error,
				)
			})
		}
	}, [sessionId]);

	const handleNewSession = async () => {
		try {
			// Abort current session to prevent leaks; multi-session not supported yet
			if (sessionId) {
				await orpcClient.claudeCode.session.abort({
					sessionId: sessionId,
				})
				setSessionId(undefined);
			}

			const { sessionId: newSessionId } =
				await orpcClient.claudeCode.session.create();
			setSessionId(newSessionId);
		} catch (error) {
			console.error("Failed to start a new session", error);
		}
	}

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
	)
}
