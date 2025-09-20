import { useEffect } from "react";
import { useInspectorActorRef, useInspectorActorSelector } from "../context";
import { shouldIgnoreInspectorEvent } from "../util";

export function useInspectorEvents() {
	const actorRef = useInspectorActorRef();
	const inspectState = useInspectorActorSelector((state) => state.value);

	useEffect(() => {
		if (inspectState === "idle") return;

		const handlePointerMove = (event: PointerEvent) => {
			if (shouldIgnoreInspectorEvent(event)) return;
			actorRef.send({ type: "POINTER_MOVE", event });
		};
		const handlePointerDown = (event: PointerEvent) => {
			if (shouldIgnoreInspectorEvent(event)) return;
			actorRef.send({ type: "POINTER_DOWN", event });
		};
		const handlePointerLeave = (event: PointerEvent) => {
			if (shouldIgnoreInspectorEvent(event)) return;
			actorRef.send({ type: "POINTER_LEAVE" });
		};

		document.addEventListener("pointermove", handlePointerMove, {
			capture: true,
		});
		document.addEventListener("pointerdown", handlePointerDown, {
			capture: true,
		});
		document.addEventListener("pointerleave", handlePointerLeave, {
			capture: true,
		});

		return () => {
			document.removeEventListener("pointermove", handlePointerMove, {
				capture: true,
			});
			document.removeEventListener("pointerdown", handlePointerDown, {
				capture: true,
			});
			document.removeEventListener("pointerleave", handlePointerLeave, {
				capture: true,
			});
		};
	}, [actorRef, inspectState]);
}
