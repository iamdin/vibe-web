import type { ChannelOptions } from "birpc";

const EVENT_NAME = "vibe-dev-rpc-message";

export const createChannelOption = (port: MessagePort) => {
	// must call start to make addEventListeners work
	port.start();

	return {
		post: (data) => {
			console.log("postMessage", data);
			port.postMessage(data);
		},
		on: (handler) => {
			console.log("addEventListener", handler);
			port.addEventListener("message", (event) => {
				console.log("event listener message", event);
				handler(event.data);
			});
		},
		// off: (handler) => {
		// 	port.removeEventListener("message", handler);
		// 	port.close();
		// },
		bind: "functions",
	} satisfies ChannelOptions;
};

export const createClientChannelOption = (iframe: HTMLIFrameElement) => {
	return {
		post: (data) => {
			iframe.contentWindow?.postMessage(
				{
					event: EVENT_NAME,
					data,
				},
				"*",
			);
		},
		on: (handler) => {
			window.addEventListener("message", (event) => {
				if (
					event.source === iframe.contentWindow &&
					event.data.event === EVENT_NAME
				) {
					handler(event.data.data);
				}
			});
		},
	} satisfies ChannelOptions;
};

export const createServerChannelOption = () => {
	return {
		post: (data) => {
			console.log("postMessage", data);
			window.parent.postMessage(
				{
					event: EVENT_NAME,
					data,
				},
				"*",
			);
		},
		on: (handler) => {
			window.addEventListener("message", (event) => {
				if (event.source === window.parent && event.data.event === EVENT_NAME) {
					handler(event.data.data);
				}
			});
		},
	} satisfies ChannelOptions;
};

export type { Client, ClientFunctions } from "./client";
export type { Server, ServerFunctions } from "./server";
