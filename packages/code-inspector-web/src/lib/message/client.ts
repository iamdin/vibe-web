import type { BirpcOptions, BirpcReturn } from "birpc";
import type { InspectedTargetData } from "../../types";
import { RPC_EVENT_NAME } from "./constants";
import type { ServerFunctions } from "./server";
import type { Message } from "./type";

export interface ClientFunctions {
	clientHello: (data: string) => Promise<string>;
	/**
	 * inspector
	 * @param data - The data to send to the server.
	 * @returns - The response from the server.
	 */
	inspectorInspected: (data: {
		targets: InspectedTargetData[];
	}) => Promise<void>;
}

export type Client = BirpcReturn<ClientFunctions, ServerFunctions>;

export const createClientBirpcOption = (iframe: HTMLIFrameElement) => {
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
	} satisfies BirpcOptions<ClientFunctions>;
};
