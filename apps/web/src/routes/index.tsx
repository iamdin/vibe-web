import { orpc } from "@/lib/orpc";
import { Button } from "@vibe-web/ui/components/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute({
	component: HomeComponent,
});

function HomeComponent() {
	const [input, setInput] = useState("");

	const [sessionId, setSessionId] = useState<string>();

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
			// Clear input immediately
			setInput("");
		}
	};

	return (
		<div>
			<Button onClick={handleNewSession}>new session</Button>
		</div>
	);
}
