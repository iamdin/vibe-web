import { createStore } from "@xstate/store";
import { v7 as uuid } from "uuid";
import type { InspectedTarget, InspectedTargetData } from "./types";
import { tryInspectElement } from "./util";

/**
 * Inspector Store - For iframe/client side (with emit events)
 *
 * Full-featured store with pointer event handling and emit events.
 * Used in iframe where actual DOM inspection happens.
 */
export const inspectorStore = createStore({
	context: {
		state: "idle" as "idle" | "active",
		currentTarget: undefined as Omit<InspectedTarget, "id"> | undefined,
		inspectedTargets: [] as InspectedTarget[],
	},
	emits: {
		STARTED: () => {},
		STOPPED: () => {},
		TARGET_REMOVED: (_payload: { id: string }) => {},
		TARGETS_CLEARED: () => {},
		// Note: POINTER_DOWN does NOT emit to avoid recursion
		// It only happens in iframe, and we use subscribe to notify parent
	},
	on: {
		START: (context, _event, enqueue) => {
			enqueue.emit.STARTED();
			return {
				...context,
				state: "active" as const,
			};
		},
		STOP: (_context, _event, enqueue) => {
			enqueue.emit.STOPPED();
			return {
				state: "idle" as const,
				currentTarget: undefined,
				inspectedTargets: [],
			};
		},
		POINTER_MOVE: (context, event: { event: PointerEvent }) => {
			if (context.state !== "active") return context;

			const current = tryInspectElement(event.event, context.inspectedTargets);
			if (!current) {
				if (!context.currentTarget) return context;
				return {
					...context,
					currentTarget: undefined,
				};
			}

			current.element.style.cursor = "pointer";

			return {
				...context,
				currentTarget: {
					element: current.element,
					metadata: current.metadata,
				},
			};
		},
		POINTER_DOWN: (context, event: { event: PointerEvent }) => {
			if (context.state !== "active") return context;

			event.event.preventDefault();
			event.event.stopPropagation();
			event.event.stopImmediatePropagation();

			const currentTarget = context.currentTarget;
			if (!currentTarget) return context;

			if (
				context.inspectedTargets.some(
					(target) => target.element === currentTarget.element,
				)
			)
				return context;

			const newTarget = {
				id: uuid(),
				...currentTarget,
			};

			return {
				...context,
				currentTarget: undefined,
				inspectedTargets: [...context.inspectedTargets, newTarget],
			};
		},
		POINTER_LEAVE: (context) => {
			if (context.state !== "active") return context;
			return {
				...context,
				currentTarget: undefined,
			};
		},
		REMOVE_INSPECTED_TARGET: (context, event: { id: string }, enqueue) => {
			const nextTargets = context.inspectedTargets.filter(
				(target) => target.id !== event.id,
			);

			enqueue.emit.TARGET_REMOVED({ id: event.id });

			return {
				...context,
				inspectedTargets: nextTargets,
			};
		},
		CLEAR_INSPECTED_TARGETS: (context, _event, enqueue) => {
			enqueue.emit.TARGETS_CLEARED();
			return {
				...context,
				inspectedTargets: [],
			};
		},
		// This event is for RPC sync only - does NOT emit to prevent recursion
		SET_INSPECTED_TARGETS: (context, event: { targets: InspectedTarget[] }) => ({
			...context,
			inspectedTargets: event.targets,
		}),
	},
});

/**
 * Inspector Store Simple - For parent/vibe side (without emit events)
 *
 * Simplified store that maintains local UI state independently from iframe's inspectorStore.
 * Uses InspectedTargetData (without DOM element references) since Host doesn't need them.
 * Supports optimistic updates on user actions and receives sync updates from iframe via RPC.
 */
export const inspectorStoreSimple = createStore({
	context: {
		state: "idle" as "idle" | "active",
		inspectedTargets: [] as InspectedTargetData[],
	},
	on: {
		// Optimistic updates - called by Host UI actions
		START: (context) => ({
			...context,
			state: "active" as const,
		}),
		STOP: () => ({
			state: "idle" as const,
			inspectedTargets: [],
		}),
		REMOVE_INSPECTED_TARGET: (context, event: { id: string }) => ({
			...context,
			inspectedTargets: context.inspectedTargets.filter(
				(target) => target.id !== event.id,
			),
		}),
		CLEAR_INSPECTED_TARGETS: (context) => ({
			...context,
			inspectedTargets: [],
		}),
		// Sync from iframe via RPC - overwrites local state with authoritative data
		SET_INSPECTED_CHANGE: (
			context,
			event: { targets: InspectedTargetData[]; state: "idle" | "active" },
		) => ({
			...context,
			state: event.state,
			inspectedTargets: event.targets,
		}),
	},
});
