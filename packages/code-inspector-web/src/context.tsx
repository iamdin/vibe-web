import { createActorContext } from "@xstate/react";
import { useInspectorEvents } from "./hooks/use-inspect-events";
import { inspectorMachine } from "./machine";

const InspectActorContext = createActorContext(inspectorMachine, {
	inspect: {},
});

const InspectorActorProvider = InspectActorContext.Provider;
export const useInspectorActorRef = InspectActorContext.useActorRef;
export const useInspectorActorSelector = InspectActorContext.useSelector;

function InspectorRoot({ children }: { children: React.ReactNode }) {
	/**
	 * addEventListeners to binding machine events
	 */
	useInspectorEvents();

	return <>{children}</>;
}

export const InspectorProvider = ({
	children,
}: { children: React.ReactNode }) => {
	return (
		<InspectorActorProvider>
			<InspectorRoot>{children}</InspectorRoot>
		</InspectorActorProvider>
	);
};
