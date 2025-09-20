import { VIWEB_EXTENSION_NAMESPACE } from "@vibe-web/shared/extension";
import { ViwebExtensionMessage } from "@vibe-web/shared/extension/message";
import {
	allowWindowMessaging,
	onMessage,
	sendMessage,
} from "webext-bridge/content-script";

// await injectScript("/content-main-world.js");

console.log("content");

allowWindowMessaging(VIWEB_EXTENSION_NAMESPACE);
// proxy, content-script window -> sidepanel
onMessage(ViwebExtensionMessage.WebAppInit, async (event) => {
	return await sendMessage(
		ViwebExtensionMessage.WebAppInit,
		event.data,
		"sidepanel",
	);
});
onMessage(ViwebExtensionMessage.Inspected, async (event) => {
	return await sendMessage(
		ViwebExtensionMessage.Inspected,
		event.data,
		"sidepanel",
	);
});
