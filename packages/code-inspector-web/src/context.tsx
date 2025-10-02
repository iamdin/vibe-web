import { InspectorIndicator } from "./components/indicator";
import { useInspectorEvents } from "./hooks/use-inspect-events";
import { inspectorStore } from "./store";

export { inspectorStore };

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
		<Inspector>
			{children}
			<InspectorIndicator />
		</Inspector>
	);
};
