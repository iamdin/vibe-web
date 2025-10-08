import type { BirpcOptions } from "birpc";
import { RPC_EVENT_NAME } from "./constants";
import type { Message } from "./type";

export const createClientBirpcOption = <T>(iframe: HTMLIFrameElement) => {
	return {
		post: (data) => {
			iframe.contentWindow?.postMessage(
				{
					event: RPC_EVENT_NAME,
					data,
				} satisfies Message,
				"*",
			);
		},
		on: (handler) => {
			window.addEventListener("message", (event) => {
				const data = event.data satisfies Message;
				if (
					event.source === iframe.contentWindow &&
					data.event === RPC_EVENT_NAME
				) {
					handler(data.data);
				}
			});
		},
		timeout: 1000,
	} satisfies BirpcOptions<T>;
};
