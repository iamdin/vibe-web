import { createActorContext } from "@xstate/react";
import { InspectorIndicator } from "./components/indicator";
import { useInspectorEvents } from "./hooks/use-inspect-events";
import { inspectorMachine } from "./machine";

const InspectActorContext = createActorContext(inspectorMachine, {
	inspect: {},
});

const InspectorActorProvider = InspectActorContext.Provider;
export const useInspectorActorRef = InspectActorContext.useActorRef;
export const useInspectorActorSelector = InspectActorContext.useSelector;

function Inspector({ children }: { children: React.ReactNode }) {
	/**
	 * addEventListeners to binding machine events
	 */
	useInspectorEvents();

	return <>{children}</>;
}

export const InspectorProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<InspectorActorProvider>
			<Inspector>
				{children}
				<InspectorIndicator />
			</Inspector>
		</InspectorActorProvider>
	);
};
