import {
	type InspectedTargetData,
	InspectorIndicator,
	useInspectorActorRef,
} from "@vibe-web/code-inspector-web";
import { useEffect } from "react";

export function Inspector() {
	const actorRef = useInspectorActorRef();

	useEffect(() => {
		const subscription = actorRef.subscribe((state) => {
			const targets: InspectedTargetData[] = state.context.inspectedTargets.map(
				(target) => ({
					id: target.id,
					metadata: target.metadata,
				}),
			);
			window.VIWEB_BROWSER_EXTENSION_API?.inspected?.({ targets });
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [actorRef]);

	return <InspectorIndicator />;
}

declare global {
	interface Window {
		VIWEB_BROWSER_EXTENSION_API: {
			inspected: (data: { targets: InspectedTargetData[] }) => void;
		};
	}
}
