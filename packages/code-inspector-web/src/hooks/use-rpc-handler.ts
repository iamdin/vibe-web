import { useEffect, useMemo } from "react";
import { inspectorStore } from "../context";
import { inspectorStoreSimple } from "../store";
import type { InspectedTarget, InspectedTargetData } from "../types";

export interface InspectorRpcListener {
	onInspectedChange: (data: {
		targets: InspectedTargetData[];
		state: "idle" | "active";
	}) => Promise<void>;
}

export interface InspectorRpcDispatch {
	inspectStart(): Promise<void>;
	inspectStop(): Promise<void>;
	inspectRemove(id: string): Promise<void>;
	inspectClear(): Promise<void>;
}

/**
 * RPC Server Hook - Use in iframe/client side
 *
 * Uses store.select() to subscribe to specific state changes and notify parent via RPC.
 * Provides RPC handlers that receive commands from parent and update local store.
 */
export function useInspectorRpcServer(
	getter: () => InspectorRpcListener,
	options: {
		enable: boolean;
	},
) {
	useEffect(() => {
		if (!options.enable) return;

		// Use selector to only subscribe to targets changes
		const targetsSelector = inspectorStore.select((context) =>
			context.inspectedTargets.map((target: InspectedTarget) => ({
				id: target.id,
				metadata: target.metadata,
			})),
		);

		const targetsSub = targetsSelector.subscribe((targets) => {
			const state = inspectorStore.getSnapshot().context.state;
			getter().onInspectedChange({ targets, state });
		});

		// Listen to state change events
		const stateSubs = [
			inspectorStore.on("STARTED", () => {
				const snapshot = inspectorStore.getSnapshot();
				const targets = snapshot.context.inspectedTargets.map((target: InspectedTarget) => ({
					id: target.id,
					metadata: target.metadata,
				}));
				getter().onInspectedChange({ targets, state: "active" });
			}),
			inspectorStore.on("STOPPED", () => {
				getter().onInspectedChange({ targets: [], state: "idle" });
			}),
		];

		return () => {
			targetsSub.unsubscribe();
			for (const sub of stateSubs) {
				sub.unsubscribe();
			}
		};
	}, [getter, options.enable]);

	const handler = useMemo(
		() =>
			({
				async inspectStart() {
					inspectorStore.trigger.START();
				},
				async inspectStop() {
					inspectorStore.trigger.STOP();
				},
				async inspectRemove(id) {
					inspectorStore.trigger.REMOVE_INSPECTED_TARGET({ id });
				},
				async inspectClear() {
					inspectorStore.trigger.CLEAR_INSPECTED_TARGETS();
				},
			}) satisfies InspectorRpcDispatch,
		[],
	);

	return handler;
}

/**
 * RPC Client Hook - Use in parent/vibe side
 *
 * Uses inspectorStoreSimple (without emit events) for the client/parent side.
 * Provides RPC listener that receives notifications from iframe and updates local store.
 *
 * Note: Client side doesn't listen to local store events because it uses inspectorStoreSimple
 * which doesn't emit. Instead, UI components trigger actions via dispatch from useInspectorHost.
 */
export function useInspectorRpcClient(options: { enable: boolean }) {
	const listener = useMemo<InspectorRpcListener>(
		() => ({
			async onInspectedChange({ targets, state }) {
				if (!options.enable) return;
				// Sync RPC state and targets from iframe to local inspectorStoreSimple
				// Uses SET_INSPECTED_CHANGE to update both state and targets
				inspectorStoreSimple.trigger.SET_INSPECTED_CHANGE({
					targets,
					state,
				});
			},
		}),
		[options.enable],
	);

	return listener;
}
