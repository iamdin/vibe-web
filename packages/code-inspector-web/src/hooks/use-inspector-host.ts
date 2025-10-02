import { useMemo } from "react";
import { inspectorStoreSimple } from "../store";
import type { InspectedTargetData } from "../types";

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
 * Inspector Host Hook - Use in parent/vibe side
 *
 * Uses inspectorStoreSimple for optimistic UI updates.
 * Provides RPC dispatcher that updates local store + sends commands to iframe.
 * Provides RPC listener that receives iframe notifications and syncs local store.
 */
export function useInspectorHost(
	getter: () => InspectorRpcDispatch,
	options: {
		enable: boolean;
	},
) {
	const dispatch = useMemo<InspectorRpcDispatch>(
		() => ({
			async inspectStart() {
				if (!options.enable) return;
				// Optimistic update
				inspectorStoreSimple.trigger.START();
				// Sync to iframe
				await getter().inspectStart();
			},
			async inspectStop() {
				if (!options.enable) return;
				// Optimistic update
				inspectorStoreSimple.trigger.STOP();
				// Sync to iframe
				await getter().inspectStop();
			},
			async inspectRemove(id: string) {
				if (!options.enable) return;
				// Optimistic update
				inspectorStoreSimple.trigger.REMOVE_INSPECTED_TARGET({ id });
				// Sync to iframe
				await getter().inspectRemove(id);
			},
			async inspectClear() {
				if (!options.enable) return;
				// Optimistic update
				inspectorStoreSimple.trigger.CLEAR_INSPECTED_TARGETS();
				// Sync to iframe
				await getter().inspectClear();
			},
		}),
		[getter, options.enable],
	);

	const listener = useMemo<InspectorRpcListener>(
		() => ({
			async onInspectedChange({ targets, state }) {
				if (!options.enable) return;
				// Sync from iframe (authoritative source)
				inspectorStoreSimple.trigger.SET_INSPECTED_CHANGE({
					targets,
					state,
				});
			},
		}),
		[options.enable],
	);

	return {
		dispatch,
		listener,
	};
}
