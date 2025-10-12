"use client";

import { cn } from "@vibe-web/ui/lib/utils";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type StreamResponseProps = ComponentProps<typeof Streamdown>;

export const StreamResponse = memo(
	({ className, ...props }: StreamResponseProps) => (
		<Streamdown
			className={cn(
				"size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
				className,
			)}
			{...props}
		/>
	),
	(prevProps, nextProps) => prevProps.children === nextProps.children,
);

StreamResponse.displayName = "StreamResponse";
