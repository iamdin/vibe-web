import type { InspectedTargetData } from "@vibe-web/code-inspector-web";
import type { ViwebExtensionMessage } from "@vibe-web/shared/extension/message";
import type { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
	export interface ProtocolMap {
		[ViwebExtensionMessage.WebAppInit]: ProtocolWithReturn<
			{ url: string },
			void
		>;
		[ViwebExtensionMessage.Inspected]: ProtocolWithReturn<
			{ targets: InspectedTargetData[] },
			void
		>;
	}
}
