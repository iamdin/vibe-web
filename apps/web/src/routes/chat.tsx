import { Button } from "@vibe-web/ui/components/button";
import { useState } from "react";
import { Chat } from "@/components/chat";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute({
	component: Component,
});

function Component() {
	const [sessionId, setSessionId] = useState<string | undefined>(undefined);

	const handleNewSession = async () => {
		try {
			// Abort current session to prevent leaks; multi-session not supported yet
			if (sessionId) {
				await orpc.claudeCode.session.abort.call({
					sessionId: sessionId,
				})
				setSessionId(undefined);
			}

			const { sessionId: newSessionId } =
				await orpc.claudeCode.session.create.call();
			setSessionId(newSessionId);
		} catch (error) {
			console.error("Failed to start a new session", error);
		}
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between p-4 border-b bg-background">
				<h1 className="text-xl font-semibold">Claude Code Chat</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={handleNewSession}>
						New Session
					</Button>
				</div>
			</div>
			<Chat />
		</div>
	)
}