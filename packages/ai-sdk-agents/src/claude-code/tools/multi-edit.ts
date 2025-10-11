import { tool, type UIToolInvocation } from "ai";
import { z } from "zod/v4";

export const MultiEdit = tool({
	type: "provider-defined",
	id: "claude-code.MultiEdit",
	name: "MultiEdit",
	args: {},
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#multiedit
	inputSchema: z.object({
		/**
		 * The absolute path to the file to modify
		 */
		file_path: z.string(),
		/**
		 * Array of edit operations to perform sequentially
		 */
		edits: z.array(
			z.object({
				/**
				 * The text to replace
				 */
				old_string: z.string(),
				/**
				 * The text to replace it with
				 */
				new_string: z.string(),
				/**
				 * Replace all occurrences (default false)
				 */
				replace_all: z.boolean().optional(),
			}),
		),
	}),
	// Docs: https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript#multiedit-2
	outputSchema: z.string(),
});

export type MultiEditUIToolInvocation = UIToolInvocation<typeof MultiEdit>;
