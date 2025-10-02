import { useEffect, useMemo } from "react";
import { useInspectorActorRef } from "../context";
import type { InspectedTargetData } from "../types";

export interface InspectorRpcListener {
	onInspectedChange: (data: {
		targets: InspectedTargetData[];
	}) => Promise<void>;
}

export interface InspectorRpcDispatch {
	inspectStart(): Promise<void>;
	inspectStop(): Promise<void>;
	inspectRemove(id: string): Promise<void>;
	inspectClear(): Promise<void>;
}

export function useInspectorRpcHandler(
	getter: () => InspectorRpcListener,
	options: {
		enable: boolean;
	},
) {
	const actorRef = useInspectorActorRef();

	useEffect(() => {
		if (!options.enable) return;

		const subscription = actorRef.subscribe((state) => {
			const targets: InspectedTargetData[] = state.context.inspectedTargets.map(
				(target) => ({
					id: target.id,
					metadata: target.metadata,
				}),
			);

			const client = getter();
			client.onInspectedChange({ targets });
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [getter, actorRef, options.enable]);

	const handler = useMemo(
		() =>
			({
				async inspectStart() {
					actorRef.send({ type: "START" });
				},
				async inspectStop() {
					actorRef.send({ type: "STOP" });
				},
				async inspectRemove(id) {
					actorRef.send({ type: "REMOVE_INSPECTED_TARGET", id });
				},
				async inspectClear() {
					actorRef.send({ type: "CLEAR_INSPECTED_TARGETS" });
				},
			}) satisfies InspectorRpcDispatch,
		[actorRef],
	);

	return handler;
}
