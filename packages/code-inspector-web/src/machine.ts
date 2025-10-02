import invariant from "tiny-invariant";
import { v7 as uuid } from "uuid";
import { assign, setup } from "xstate";
import type { InspectedTarget } from "./types";
import { tryInspectElement } from "./util";

interface InspectContext {
	currentTarget?: Omit<InspectedTarget, "id">;
	inspectedTargets: InspectedTarget[];
}

type InspectEvents =
	| { type: "START" }
	| { type: "STOP" }
	| { type: "POINTER_MOVE"; event: PointerEvent }
	| { type: "POINTER_DOWN"; event: PointerEvent }
	| { type: "POINTER_LEAVE" }
	| { type: "REMOVE_INSPECTED_TARGET"; id: string }
	| { type: "CLEAR_INSPECTED_TARGETS" }
	| { type: "SET_INSPECTED_TARGETS"; targets: InspectedTarget[] };

export const inspectorMachine = setup({
	types: {
		context: {} as InspectContext,
		events: {} as InspectEvents,
	},
	actions: {
		setCurrentTarget: assign(({ event, context }) => {
			invariant(event.type === "POINTER_MOVE", "Invalid event type");

			const current = tryInspectElement(event.event, context.inspectedTargets);
			if (!current) {
				if (!context.currentTarget) return {};
				return {
					currentTarget: undefined,
				};
			}

			current.element.style.cursor = "pointer";

			return {
				currentTarget: {
					element: current.element,
					metadata: current.metadata,
				},
			};
		}),
		pickCurrentTarget: assign(({ event, context }) => {
			invariant(event.type === "POINTER_DOWN", "Invalid event type");

			event.event.preventDefault();
			event.event.stopPropagation();
			event.event.stopImmediatePropagation();

			const currentTarget = context.currentTarget;
			if (!currentTarget) return {};

			if (
				context.inspectedTargets.some(
					(target) => target.element === currentTarget.element,
				)
			)
				return {};

			const newTarget = {
				id: uuid(),
				...currentTarget,
			};

			return {
				currentTarget: undefined,
				inspectedTargets: [...context.inspectedTargets, newTarget],
			};
		}),
		removeCurrentTarget: assign({
			currentTarget: undefined,
		}),
		removeInspectedTarget: assign(({ event, context }) => {
			invariant(event.type === "REMOVE_INSPECTED_TARGET", "Invalid event type");

			const nextTargets = context.inspectedTargets.filter(
				(target) => target.id !== event.id,
			);

			return {
				inspectedTargets: nextTargets,
			};
		}),
		clearInspectedTargets: assign({
			inspectedTargets: () => [],
		}),
		setInspectedTargets: assign(({ event }) => {
			invariant(event.type === "SET_INSPECTED_TARGETS", "Invalid event type");

			return {
				inspectedTargets: event.targets,
			};
		}),
	},
}).createMachine({
	id: "inspector",
	initial: "idle",
	context: {
		inspectedTargets: [],
	},
	states: {
		idle: {
			entry: ["removeCurrentTarget", "clearInspectedTargets"],
			on: {
				START: "active",
			},
		},
		active: {
			on: {
				POINTER_MOVE: { actions: "setCurrentTarget" },
				POINTER_DOWN: { actions: "pickCurrentTarget" },
				POINTER_LEAVE: { actions: "removeCurrentTarget" },
				REMOVE_INSPECTED_TARGET: { actions: "removeInspectedTarget" },
				CLEAR_INSPECTED_TARGETS: { actions: "clearInspectedTargets" },
				SET_INSPECTED_TARGETS: { actions: "setInspectedTargets" },
				STOP: { target: "idle", actions: ["removeCurrentTarget"] },
			},
		},
	},
});
