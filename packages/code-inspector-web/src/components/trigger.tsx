import { Button } from "@vibe-web/ui/components/button";
import { MousePointerClickIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useInspectorActorRef, useInspectorActorSelector } from "../context";

export const InspectorTrigger = ({
	className,
	...props
}: ComponentProps<typeof Button>) => {
	const state = useInspectorActorSelector((state) => state.value);
	const isIdle = useInspectorActorSelector((state) => state.matches("idle"));
	const actorRef = useInspectorActorRef();

	return (
		<Button
			variant={isIdle ? "ghost" : "default"}
			data-state={state}
			className={className}
			{...props}
			onClick={() => {
				if (isIdle) actorRef.send({ type: "START" });
				else actorRef.send({ type: "STOP" });
			}}
		>
			<MousePointerClickIcon />
		</Button>
	);
};
