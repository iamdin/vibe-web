import type { BirpcOptions, BirpcReturn } from "birpc";
import type { ClientFunctions } from "./client";
import { RPC_EVENT_NAME } from "./constants";

export interface ServerFunctions {
	healthCheck: () => Promise<boolean>;
	/**
	 * start to inspect
	 * @returns - The response from the server.
	 */
	inspectorStart: () => Promise<void>;
	/**
	 * stop to inspect
	 * @returns - The response from the server.
	 */
	inspectorStop: () => Promise<void>;
}

export type Server = BirpcReturn<ServerFunctions, ClientFunctions>;

interface Message {
	event: string;
	data: unknown;
}

export const createServerBirpcOption = () => {
	return {
		post: (data) => {
			window.parent.postMessage(
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
				if (event.source === window.parent && data.event === RPC_EVENT_NAME) {
					handler(data.data);
				}
			});
		},
	} satisfies BirpcOptions<ServerFunctions>;
};
