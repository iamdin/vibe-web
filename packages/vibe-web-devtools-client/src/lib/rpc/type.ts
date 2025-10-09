export interface Message {
	event: "vibe-web-rpc-message";
	data: unknown;
}

export interface BuiltinFunctions {
	connect(): Promise<boolean>;
}
