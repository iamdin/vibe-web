import type { InspectedTargetData } from "@vibe-web/code-inspector-web";
import { VIWEB_EXTENSION_NAMESPACE } from "@vibe-web/shared/extension";
import { ViwebExtensionMessage } from "@vibe-web/shared/extension/message";
import { sendMessage, setNamespace } from "webext-bridge/window";

declare global {
	interface Window {
		VIWEB_LOCAL_URL: string;
		VIWEB_BROWSER_EXTENSION_API: {
			inspected: (data: { targets: InspectedTargetData[] }) => void;
		};
	}
}

setNamespace(VIWEB_EXTENSION_NAMESPACE);

console.log("content-main-world", window.VIWEB_LOCAL_URL);

if (window.VIWEB_LOCAL_URL) {
	sendMessage(
		ViwebExtensionMessage.WebAppInit,
		{ url: window.VIWEB_LOCAL_URL },
		"content-script",
	);
}

window.VIWEB_BROWSER_EXTENSION_API = {
	inspected: (data: { targets: InspectedTargetData[] }) => {
		sendMessage(ViwebExtensionMessage.Inspected, data, "content-script");
	},
};
