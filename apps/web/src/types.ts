import type { UIMessage } from "ai";

export type UIDataTypes = {
	inspector: {
		file?: string;
		line?: number;
		column?: number;
		component?: string;
	}[];
};

export type ClaudeCodeUIMessage = UIMessage<
	undefined,
	UIDataTypes
>;