"use client";

import { Collapsible as CollapsiblePrimitive } from "@ark-ui/react/collapsible";

import { cn } from "@vibe-web/ui/lib/utils";

function Collapsible({ ...props }: CollapsiblePrimitive.RootProps) {
	return <CollapsiblePrimitive.Root {...props} />;
}

function CollapsibleContent({
	className,
	...props
}: CollapsiblePrimitive.ContentProps) {
	return (
		<CollapsiblePrimitive.Content
			className={cn(
				"overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
				className,
			)}
			{...props}
		/>
	);
}

function CollapsibleContext({ ...props }: CollapsiblePrimitive.ContextProps) {
	return <CollapsiblePrimitive.Context {...props} />;
}

function CollapsibleIndicator({
	...props
}: CollapsiblePrimitive.IndicatorProps) {
	return <CollapsiblePrimitive.Indicator {...props} />;
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.TriggerProps) {
	return <CollapsiblePrimitive.Trigger {...props} />;
}

export {
	Collapsible,
	CollapsibleContent,
	CollapsibleContext,
	CollapsibleIndicator,
	CollapsibleTrigger,
};
