import { tool } from "ai";
import { z } from "zod";

export const Write = tool({
	type: "provider-defined",
	id: "claude-code.Write",
	name: "Write",
	args: {},
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#write
	inputSchema: z.object({
		/**
		 * The absolute path to the file to write
		 */
		file_path: z.string(),
		/**
		 * The content to write to the file
		 */
		content: z.string(),
	}),
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#write-2
	outputSchema: z.string(),
});
