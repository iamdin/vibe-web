"use client";

import {
	autoUpdate,
	flip,
	offset,
	shift,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from "@floating-ui/react";
import { CircleXIcon, SquarePenIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { Chat } from "@/components/chat";
import { useToolbarContext } from "@/context/toolbar";
import { Button } from "@vibe-web/ui/components/button";

export function FloatingChat() {
	const { toolbarRef, open, setOpen } = useToolbarContext();

	const { refs, floatingStyles, context } = useFloating({
		open,
		strategy: "fixed",
		onOpenChange: (open) => {
			if (!open) close();
		},
		middleware: [
			offset({ mainAxis: 5, alignmentAxis: 4 }),
			flip(),
			shift({ padding: 10 }),
		],
		whileElementsMounted: autoUpdate,
	});
	// Handles opening the floating element via the click event.
	const { getFloatingProps } = useInteractions([
		useDismiss(context),
		useRole(context),
	]);

	useEffect(() => {
		if (open && toolbarRef?.current) refs.setReference(toolbarRef.current);
	}, [open, refs, toolbarRef]);

	return (
		<AnimatePresence mode="wait">
			{open && (
				<div
					ref={refs.setFloating}
					style={{
						...floatingStyles,
						zIndex: 2147483647,
						height: 520,
						width: 380,
					}}
					{...getFloatingProps()}
				>
					<motion.div className="bg-popover text-popover-foreground rounded-3xl shadow-lg border flex flex-col h-full overflow-hidden">
						<div className="flex items-center justify-between p-2 flex-shrink-0">
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									aria-label="Close"
									title="Close"
									className="size-7 text-muted-foreground/70"
									onClick={() => setOpen(false)}
								>
									<CircleXIcon size={16} aria-hidden="true" />
								</Button>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									aria-label="New Session"
									title="New Session"
									className="size-7 text-muted-foreground/70"
								>
									<SquarePenIcon size={16} aria-hidden="true" />
								</Button>
							</div>
						</div>

						<Chat />
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
