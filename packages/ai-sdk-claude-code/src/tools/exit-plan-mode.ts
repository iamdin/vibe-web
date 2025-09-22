import { tool } from "ai";
import { z } from "zod";

export const ExitPlanMode = tool({
	type: "provider-defined",
	id: "claude-code.ExitPlanMode",
	name: "ExitPlanMode",
	args: {},
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#exitplanmode
	inputSchema: z.object({
		/**
		 * The plan to run by the user for approval
		 */
		plan: z.string(),
	}),
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#exitplanmode-2
	outputSchema: z.string(),
});
