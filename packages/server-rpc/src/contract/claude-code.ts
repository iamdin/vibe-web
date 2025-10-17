import type { PermissionUpdate } from "@anthropic-ai/claude-agent-sdk";
import { oc, type } from "@orpc/contract";
import type { ToolPermissionRequest } from "@vibe-web/agents/claude-code";
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
	requestPermission: oc
		.input(
			z.object({
				sessionId: z.string(),
			}),
		)
		.output(type<AsyncGenerator<ToolPermissionRequest>>()),
	respondPermission: oc
		.input(
			z.object({
				sessionId: z.string(),
				requestId: z.string(),
				result: z.union([
					z.object({
						behavior: z.literal("allow"),
						updatedInput: z.object().loose(),
						updatedPermissions: z.array(z.any()).optional(),
					}),
					z.object({
						behavior: z.literal("deny"),
						message: z.string(),
						interrupt: z.boolean().optional(),
					}),
				]),
			}),
		)
		.output(z.boolean()),
};
