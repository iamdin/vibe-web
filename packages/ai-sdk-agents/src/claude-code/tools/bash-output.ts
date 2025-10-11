import { tool, type UIToolInvocation } from "ai";
import { z } from "zod/v4";

export const BashOutput = tool({
	type: "provider-defined",
	id: "claude-code.BashOutput",
	name: "BashOutput",
	args: {},
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#bashoutput
	inputSchema: z.object({
		/**
		 * The ID of the background shell to retrieve output from
		 */
		bash_id: z.string(),
		/**
		 * Optional regex to filter output lines
		 */
		filter: z.string().optional(),
	}),
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#bashoutput-2
	outputSchema: z.string(),
});

export type BashOutputUIToolInvocation = UIToolInvocation<typeof BashOutput>;
