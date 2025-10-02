import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createActor } from "xstate";

import { inspectorMachine } from "./machine";
import type { InspectMetadata, InspectedTarget } from "./types";
import { tryInspectElement } from "./util";

vi.mock("uuid", () => ({
	v7: vi.fn(() => "mock-uuid"),
}));

vi.mock("./util", () => ({
	tryInspectElement: vi.fn(),
}));

const tryInspectElementMock = vi.mocked(tryInspectElement);

type MockedHTMLElement = HTMLElement & {
	style: { cursor: string };
	contains: Mock<HTMLElement["contains"]>;
	getBoundingClientRect: Mock<() => DOMRect>;
};

const createMockElement = (): MockedHTMLElement => {
	const defaultRect = {
		top: 0,
		left: 0,
		bottom: 10,
		right: 10,
		width: 10,
		height: 10,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	const getBoundingClientRect = vi
		.fn<() => DOMRect>()
		.mockReturnValue(defaultRect);

	return {
		style: { cursor: "" },
		contains: vi.fn<HTMLElement["contains"]>().mockReturnValue(false),
		getBoundingClientRect,
	} as unknown as MockedHTMLElement;
};

const appendTarget = (
	actor: ReturnType<typeof createActor>,
	element: MockedHTMLElement,
) => {
	const metadata: InspectMetadata = {
		fileName: "src/component.tsx",
		componentName: "Component",
		lineNumber: 10,
		columnNumber: 5,
	};

	tryInspectElementMock.mockReturnValue({
		element,
		metadata,
	});

	actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });

	return { metadata };
};

describe("inspectorMachine", () => {
	beforeEach(() => {
		tryInspectElementMock.mockReset();
	});

	it("activates on START and returns to idle on STOP", () => {
		const actor = createActor(inspectorMachine).start();

		expect(actor.getSnapshot().value).toBe("idle");

		actor.send({ type: "START" });
		expect(actor.getSnapshot().value).toBe("active");

		const element = createMockElement();
		appendTarget(actor, element);

		actor.send({
			type: "POINTER_DOWN",
			event: {
				preventDefault: vi.fn(),
				stopImmediatePropagation: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as PointerEvent,
		});

		expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(1);

		actor.send({ type: "STOP" });

		const snapshot = actor.getSnapshot();
		expect(snapshot.value).toBe("idle");
		expect(snapshot.context.inspectedTargets).toHaveLength(0);
		expect(snapshot.context.currentTarget).toBeUndefined();
	});

	it("stores the current hover target on pointer move", () => {
		const actor = createActor(inspectorMachine).start();
		actor.send({ type: "START" });

		const element = createMockElement();
		const { metadata } = appendTarget(actor, element);

		const snapshot = actor.getSnapshot();
		expect(snapshot.context.currentTarget).toEqual({
			element,
			metadata,
		});
		expect(element.style.cursor).toBe("pointer");

		tryInspectElementMock.mockReturnValue(undefined);
		actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
		expect(actor.getSnapshot().context.currentTarget).toBeUndefined();
	});

	it("picks the current hover target on pointer down and ignores duplicates", () => {
		const actor = createActor(inspectorMachine).start();
		actor.send({ type: "START" });

		const element = createMockElement();
		appendTarget(actor, element);

		const pointerDownEvent = {
			preventDefault: vi.fn(),
			stopImmediatePropagation: vi.fn(),
			stopPropagation: vi.fn(),
		} as unknown as PointerEvent;

		actor.send({ type: "POINTER_DOWN", event: pointerDownEvent });

		let snapshot = actor.getSnapshot();
		expect(snapshot.context.inspectedTargets).toHaveLength(1);
		expect(snapshot.context.currentTarget).toBeUndefined();
		expect(snapshot.context.inspectedTargets[0].id).toBe("mock-uuid");
		expect(pointerDownEvent.preventDefault).toHaveBeenCalledTimes(1);
		expect(pointerDownEvent.stopPropagation).toHaveBeenCalledTimes(1);
		expect(pointerDownEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);

		appendTarget(actor, element);
		actor.send({ type: "POINTER_DOWN", event: pointerDownEvent });

		snapshot = actor.getSnapshot();
		expect(snapshot.context.inspectedTargets).toHaveLength(1);
	});

	it("updates and removes inspected targets", () => {
		const actor = createActor(inspectorMachine).start();
		actor.send({ type: "START" });

		const element = createMockElement();
		const metadata = {
			fileName: "src/component.tsx",
			componentName: "Component",
			lineNumber: 1,
			columnNumber: 1,
		};

		tryInspectElementMock.mockReturnValue({ element, metadata });
		actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
		actor.send({
			type: "POINTER_DOWN",
			event: {
				preventDefault: vi.fn(),
				stopImmediatePropagation: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as PointerEvent,
		});

		actor.send({ type: "UPDATE_INSPECTED_TARGETS" });

		let snapshot = actor.getSnapshot();
		expect(snapshot.context.inspectedTargets).toHaveLength(1);

		actor.send({
			type: "REMOVE_INSPECTED_TARGET",
			id: snapshot.context.inspectedTargets[0].id,
		});

		snapshot = actor.getSnapshot();
		expect(snapshot.context.inspectedTargets).toHaveLength(0);
	});

	describe("Error handling and edge cases", () => {
		it("should handle tryInspectElement returning undefined", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			// Set up a current target first
			const element = createMockElement();
			appendTarget(actor, element);
			expect(actor.getSnapshot().context.currentTarget).toBeDefined();

			// Then make tryInspectElement return undefined
			tryInspectElementMock.mockReturnValue(undefined);
			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.currentTarget).toBeUndefined();
		});

		it("should ignore events when in idle state", () => {
			const actor = createActor(inspectorMachine).start();

			const element = createMockElement();
			tryInspectElementMock.mockReturnValue({
				element,
				metadata: {
					fileName: "src/component.tsx",
					componentName: "Component",
					lineNumber: 1,
					columnNumber: 1,
				},
			});

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			actor.send({ type: "POINTER_DOWN", event: {} as PointerEvent });
			actor.send({ type: "UPDATE_INSPECTED_TARGETS" });

			const snapshot = actor.getSnapshot();
			expect(snapshot.value).toBe("idle");
			expect(snapshot.context.currentTarget).toBeUndefined();
			expect(snapshot.context.inspectedTargets).toHaveLength(0);
		});

		it("should handle removing non-existent target", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			actor.send({
				type: "REMOVE_INSPECTED_TARGET",
				id: "non-existent-id",
			});

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toHaveLength(0);
		});

		it("should handle element without proper metadata", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			tryInspectElementMock.mockReturnValue(undefined);
			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.currentTarget).toBeUndefined();
		});

		it("should handle empty inspected targets when updating", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			actor.send({ type: "UPDATE_INSPECTED_TARGETS" });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toHaveLength(0);
		});
	});

	describe("Concurrent event handling", () => {
		it("should handle rapid pointer move events", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element1 = createMockElement();
			const element2 = createMockElement();

			tryInspectElementMock
				.mockReturnValueOnce({
					element: element1,
					metadata: {
						fileName: "file1.tsx",
						componentName: "Comp1",
						lineNumber: 1,
						columnNumber: 1,
					},
				})
				.mockReturnValueOnce({
					element: element2,
					metadata: {
						fileName: "file2.tsx",
						componentName: "Comp2",
						lineNumber: 2,
						columnNumber: 2,
					},
				})
				.mockReturnValueOnce(undefined);

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			expect(actor.getSnapshot().context.currentTarget?.element).toBe(element1);

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			expect(actor.getSnapshot().context.currentTarget?.element).toBe(element2);

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			expect(actor.getSnapshot().context.currentTarget).toBeUndefined();
		});

		it("should handle pointer down without current target", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const pointerDownEvent = {
				preventDefault: vi.fn(),
				stopImmediatePropagation: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as PointerEvent;

			actor.send({ type: "POINTER_DOWN", event: pointerDownEvent });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toHaveLength(0);
			expect(pointerDownEvent.preventDefault).toHaveBeenCalled();
		});

		it("should handle pointer leave correctly", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element = createMockElement();
			appendTarget(actor, element);

			expect(actor.getSnapshot().context.currentTarget).toBeDefined();

			actor.send({ type: "POINTER_LEAVE" });

			expect(actor.getSnapshot().context.currentTarget).toBeUndefined();
		});
	});

	describe("DOM element changes", () => {
		it("should handle element position changes during inspection", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element = createMockElement();

			const metadata = {
				fileName: "src/component.tsx",
				componentName: "Component",
				lineNumber: 10,
				columnNumber: 5,
			};

			tryInspectElementMock.mockReturnValue({ element, metadata });
			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });

			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			actor.send({ type: "UPDATE_INSPECTED_TARGETS" });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toHaveLength(1);
		});

		it("should handle multiple targets with different positions", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element1 = createMockElement();
			const element2 = createMockElement();

			tryInspectElementMock
				.mockReturnValueOnce({
					element: element1,
					metadata: {
						fileName: "file1.tsx",
						componentName: "Comp1",
						lineNumber: 1,
						columnNumber: 1,
					},
				})
				.mockReturnValueOnce({
					element: element2,
					metadata: {
						fileName: "file2.tsx",
						componentName: "Comp2",
						lineNumber: 2,
						columnNumber: 2,
					},
				});

			// Add first target
			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			// Add second target
			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toHaveLength(2);
		});
	});

	describe("SET_INSPECTED_TARGETS event", () => {
		it("should set inspected targets from external source", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element1 = createMockElement();
			const element2 = createMockElement();

			const targets: InspectedTarget[] = [
				{
					id: "target-1",
					element: element1,
					metadata: {
						fileName: "file1.tsx",
						componentName: "Comp1",
						lineNumber: 10,
						columnNumber: 5,
					},
				},
				{
					id: "target-2",
					element: element2,
					metadata: {
						fileName: "file2.tsx",
						componentName: "Comp2",
						lineNumber: 20,
						columnNumber: 10,
					},
				},
			];

			actor.send({ type: "SET_INSPECTED_TARGETS", targets });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toEqual(targets);
			expect(snapshot.context.inspectedTargets).toHaveLength(2);
		});

		it("should replace existing inspected targets", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			// Add a target through normal inspection
			const element1 = createMockElement();
			appendTarget(actor, element1);
			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(1);

			// Replace with new targets
			const element2 = createMockElement();
			const newTargets: InspectedTarget[] = [
				{
					id: "new-target",
					element: element2,
					metadata: {
						fileName: "new-file.tsx",
						componentName: "NewComp",
						lineNumber: 15,
						columnNumber: 8,
					},
				},
			];

			actor.send({ type: "SET_INSPECTED_TARGETS", targets: newTargets });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toEqual(newTargets);
			expect(snapshot.context.inspectedTargets).toHaveLength(1);
		});

		it("should handle empty targets array", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			// Add some targets first
			const element = createMockElement();
			appendTarget(actor, element);
			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(1);

			// Set to empty array
			actor.send({ type: "SET_INSPECTED_TARGETS", targets: [] });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toEqual([]);
			expect(snapshot.context.inspectedTargets).toHaveLength(0);
		});

		it("should preserve targets with partial metadata", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element = createMockElement();
			const targets: InspectedTarget[] = [
				{
					id: "partial-target",
					element,
					metadata: {
						componentName: "PartialComp",
						// fileName, lineNumber, columnNumber are optional
					},
				},
			];

			actor.send({ type: "SET_INSPECTED_TARGETS", targets });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toEqual(targets);
			expect(snapshot.context.inspectedTargets[0].metadata.fileName).toBeUndefined();
			expect(snapshot.context.inspectedTargets[0].metadata.lineNumber).toBeUndefined();
			expect(snapshot.context.inspectedTargets[0].metadata.columnNumber).toBeUndefined();
		});

		it("should not affect current target when setting inspected targets", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			// Set a current target through hover
			const currentElement = createMockElement();
			const currentMetadata = {
				fileName: "current.tsx",
				componentName: "CurrentComp",
				lineNumber: 5,
				columnNumber: 3,
			};

			tryInspectElementMock.mockReturnValue({
				element: currentElement,
				metadata: currentMetadata,
			});

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			expect(actor.getSnapshot().context.currentTarget).toBeDefined();

			// Set inspected targets
			const element = createMockElement();
			const targets: InspectedTarget[] = [
				{
					id: "new-target",
					element,
					metadata: {
						fileName: "new.tsx",
						componentName: "NewComp",
						lineNumber: 10,
						columnNumber: 5,
					},
				},
			];

			actor.send({ type: "SET_INSPECTED_TARGETS", targets });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.currentTarget).toBeDefined();
			expect(snapshot.context.currentTarget?.element).toBe(currentElement);
			expect(snapshot.context.inspectedTargets).toEqual(targets);
		});

		it("should only work in active state", () => {
			const actor = createActor(inspectorMachine).start();

			const element = createMockElement();
			const targets: InspectedTarget[] = [
				{
					id: "idle-target",
					element,
					metadata: {
						fileName: "file.tsx",
						componentName: "Comp",
						lineNumber: 10,
						columnNumber: 5,
					},
				},
			];

			// Try to set targets in idle state
			actor.send({ type: "SET_INSPECTED_TARGETS", targets });

			expect(actor.getSnapshot().value).toBe("idle");
			expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(0);

			// Now start and try again
			actor.send({ type: "START" });
			actor.send({ type: "SET_INSPECTED_TARGETS", targets });

			expect(actor.getSnapshot().context.inspectedTargets).toEqual(targets);
		});
	});

	describe("Complex user interactions", () => {
		it("should handle hover then click sequence", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element = createMockElement();
			const { metadata } = appendTarget(actor, element);

			expect(actor.getSnapshot().context.currentTarget?.metadata).toEqual(
				metadata,
			);
			expect(element.style.cursor).toBe("pointer");

			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.inspectedTargets).toHaveLength(1);
			expect(snapshot.context.currentTarget).toBeUndefined();
		});

		it("should handle multiple hovers without clicks", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const elements = [
				createMockElement(),
				createMockElement(),
				createMockElement(),
			];

			elements.forEach((element, index) => {
				tryInspectElementMock.mockReturnValueOnce({
					element,
					metadata: {
						fileName: `file${index}.tsx`,
						componentName: `Comp${index}`,
						lineNumber: index + 1,
						columnNumber: index + 1,
					},
				});

				actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
				expect(actor.getSnapshot().context.currentTarget?.element).toBe(
					element,
				);
				expect(element.style.cursor).toBe("pointer");
			});

			expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(0);
		});

		it("should handle restart after stop", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element = createMockElement();
			appendTarget(actor, element);

			actor.send({
				type: "POINTER_DOWN",
				event: {
					preventDefault: vi.fn(),
					stopImmediatePropagation: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as PointerEvent,
			});

			expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(1);

			actor.send({ type: "STOP" });
			expect(actor.getSnapshot().value).toBe("idle");
			expect(actor.getSnapshot().context.inspectedTargets).toHaveLength(0);

			actor.send({ type: "START" });
			expect(actor.getSnapshot().value).toBe("active");

			appendTarget(actor, element);
			expect(actor.getSnapshot().context.currentTarget).toBeDefined();
		});

		it("should handle cursor style management", () => {
			const actor = createActor(inspectorMachine).start();
			actor.send({ type: "START" });

			const element1 = createMockElement();
			const element2 = createMockElement();

			tryInspectElementMock
				.mockReturnValueOnce({
					element: element1,
					metadata: {
						fileName: "file1.tsx",
						componentName: "Comp1",
						lineNumber: 1,
						columnNumber: 1,
					},
				})
				.mockReturnValueOnce({
					element: element2,
					metadata: {
						fileName: "file2.tsx",
						componentName: "Comp2",
						lineNumber: 2,
						columnNumber: 2,
					},
				});

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			expect(element1.style.cursor).toBe("pointer");

			actor.send({ type: "POINTER_MOVE", event: {} as PointerEvent });
			expect(element2.style.cursor).toBe("pointer");
		});
	});
});
