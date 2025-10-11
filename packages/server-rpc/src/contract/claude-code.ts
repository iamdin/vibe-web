import { oc, type } from "@orpc/contract";
import type { InferUIMessageChunk, UIMessage } from "ai";
import type { ClaudeCodeTools } from "ai-sdk-agents/claude-code";
import { z } from "zod/v4";

export const claudeCodeContract = {
	session: {
		create: oc.output(
			z.object({
				sessionId: z.string(),
			}),
		),
		abort: oc.input(
			z.object({
				sessionId: z.string(),
			}),
		),
	},
	prompt: oc
		.input(
			type<{
				sessionId: string;
				message: UIMessage;
			}>(),
		)
		.output(
			type<
				AsyncGenerator<
					InferUIMessageChunk<
						UIMessage<undefined, Record<string, unknown>, ClaudeCodeTools>
					>
				>
			>(),
		),
};
