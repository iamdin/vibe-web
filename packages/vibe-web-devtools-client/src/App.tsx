import { MessageSquareIcon } from "lucide-react";

import { FloatingChat } from "@/components/floating-chat-panel";
import { useToolbarContext } from "@/context/toolbar";
import { Inspector } from "@/features/inspector/inspector";
import { Button } from "@vibe-web/ui/components/button";
import { cn } from "@vibe-web/ui/lib/utils";

export function App() {
	const { toolbarRef, open, setOpen } = useToolbarContext();

	return (
		<>
			<div
				ref={toolbarRef}
				className={cn(
					"fixed bottom-5 right-5 z-[2147483646] rounded-3xl flex items-center border border-border shadow-md select-none",
					"bg-white/80 backdrop-blur-lg dark:bg-gray-900/80",
				)}
			>
				<Button
					variant="ghost"
					// size="lg"
					className="rounded-3xl size-8"
					aria-label={open ? "Close chat" : "Open chat"}
					onClick={() => setOpen(!open)}
				>
					<MessageSquareIcon className="size-4" />
				</Button>
			</div>
			<FloatingChat />
			<Inspector />
		</>
	);
}
