export interface Message {
	event: "vibe-dev-rpc-message";
	data: unknown;
}

export interface HostFunctions {
	connect(): Promise<boolean>;
}

export interface IframeFunctions {
	connect(): Promise<boolean>;
}
