"use client";

import {
	Collapsible,
	CollapsibleContent,
	type CollapsibleProps,
	CollapsibleTrigger,
} from "@vibe-web/ui/components/collapsible";
import { cn } from "@vibe-web/ui/lib/utils";
import type { ToolUIPart } from "ai";
import type { LucideIcon } from "lucide-react";
import { ChevronRightIcon, WrenchIcon } from "lucide-react";
import {
	type ComponentProps,
	type ReactNode,
	useEffect,
	useState,
} from "react";

export type ToolProps = CollapsibleProps & {
	state?: ToolUIPart["state"];
};

export const Tool = ({ className, state, ...props }: ToolProps) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (state) {
			setOpen(state === "input-available");
		}
	}, [state]);

	return (
		<Collapsible
			open={open}
			onOpenChange={(details) => setOpen(details.open)}
			className={cn("not-prose w-full py-2", className)}
			{...props}
		/>
	);
};

export type ToolHeaderProps = {
	icon?: LucideIcon;
	className?: string;
	children?: ReactNode;
};

export const ToolHeader = ({
	className,
	icon: Icon = WrenchIcon,
	children,
	...props
}: ToolHeaderProps) => (
	<CollapsibleTrigger
		className={cn(
			"flex w-full items-center justify-between group gap-4 cursor-pointer",
			className,
		)}
		{...props}
	>
		<div className="flex items-center gap-2">
			<div className="size-4 text-muted-foreground relative">
				<Icon className="size-4 group-data-[state=open]:opacity-0 group-data-[state=open]:scale-75 group-hover:opacity-0 group-hover:scale-75 transition-all duration-200" />
				<ChevronRightIcon className="size-4 absolute inset-0 opacity-0 scale-75 group-data-[state=open]:opacity-100 group-data-[state=open]:scale-100 group-data-[state=open]:rotate-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
			</div>
			{children}
		</div>
	</CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
	<CollapsibleContent
		className={cn(
			"data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in border-l border-border ml-2 ps-4 py-2",
			className,
		)}
		{...props}
	/>
);
