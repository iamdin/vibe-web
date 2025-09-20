"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@vibe-web/ui/components/collapsible";
import { cn } from "@vibe-web/ui/lib/utils";
import type { ToolUIPart } from "ai";
import { TerminalIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export type BashToolProps = ComponentProps<typeof Collapsible>;

export const BashTool = ({ className, ...props }: BashToolProps) => (
	<Collapsible
		className={cn("not-prose mb-4 w-full rounded-md", className)}
		{...props}
	/>
);

export type BashToolHeaderProps = {
	command: string;
	description: string;
	className?: string;
};

export const BashToolHeader = ({
	className,
	command,
	description,
	...props
}: BashToolHeaderProps) => (
	<CollapsibleTrigger
		className={cn("flex w-full items-center justify-between gap-4", className)}
		{...props}
	>
		<div className="flex items-center gap-2 w-full">
			<TerminalIcon className="size-4 flex-shrink-0 text-muted-foreground" />
			<span className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">
				{description}
			</span>
		</div>
	</CollapsibleTrigger>
);

export type BashToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const BashToolContent = ({
	className,
	...props
}: BashToolContentProps) => (
	<CollapsibleContent
		className={cn(
			"data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
			className,
		)}
		{...props}
	/>
);

export type BashToolInputProps = ComponentProps<"div"> & {
	input: string;
};

export const BashToolInput = ({
	className,
	input,
	...props
}: BashToolInputProps) => (
	<div className={cn("overflow-hidden ps-2 pe-4 py-2", className)} {...props}>
		<div className="rounded-md bg-muted/50">
			<pre className="text-xs overflow-x-auto p-2">
				<code>{input}</code>
			</pre>
		</div>
	</div>
);

export type BashToolOutputProps = ComponentProps<"div"> & {
	output: ReactNode;
	errorText: ToolUIPart["errorText"];
};

export const BashToolOutput = ({
	className,
	output,
	errorText,
	...props
}: BashToolOutputProps) => {
	if (!(output || errorText)) {
		return null;
	}

	return (
		<div className={cn("space-y-2 ps-2 pe-4 pe-2", className)} {...props}>
			<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
				{errorText ? "Error" : "Result"}
			</h4>
			<div
				className={cn(
					"overflow-x-auto rounded-md text-xs [&_table]:w-full",
					errorText
						? "bg-destructive/10 text-destructive"
						: "bg-muted/50 text-foreground",
				)}
			>
				{errorText && <div>{errorText}</div>}
				{output && (
					<pre className="text-xs overflow-x-auto p-2">
						<code>{output as string}</code>
					</pre>
				)}
			</div>
		</div>
	);
};
