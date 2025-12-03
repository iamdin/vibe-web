import { oc, type } from "@orpc/contract";
import type { ToolPermissionRequest } from "@vibe-web/agents/claude-code";
import type { UIDataTypes, UIMessage, UIMessageChunk } from "ai";
import {
	McpServerStatusSchema,
	ModelInfoSchema,
	PermissionModeSchema,
	PermissionResultSchema,
	SlashCommandSchema,
	type UIMessageMetadata,
} from "ai-sdk-agents/claude-code";
import { z } from "zod/v4";

export const claudeCodeContract = {
	session: {
		create: oc.output(
			z.object({
				supportedModels: z.array(ModelInfoSchema),
				supportedCommands: z.array(SlashCommandSchema),
			}),
		),
		abort: oc.input(
			z.object({
				sessionId: z.string(),
			}),
		),
		getSupportedCommands: oc
			.input(
				z.object({
					sessionId: z.string(),
				}),
			)
			.output(z.array(SlashCommandSchema)),
		getSupportedModels: oc
			.input(
				z.object({
					sessionId: z.string(),
				}),
			)
			.output(z.array(ModelInfoSchema)),
		getMcpServers: oc
			.input(
				z.object({
					sessionId: z.string(),
				}),
			)
			.output(z.array(McpServerStatusSchema)),
		prompt: oc
			.input(
				z.object({
					sessionId: z.string().optional(),
					// TODO a abstract schema
					message: z
						.object({
							parts: z.array(z.object<UIMessage>().loose()),
						})
						.loose(),
					model: z.string().optional(),
					maxThinkingTokens: z.number().optional(),
					mode: PermissionModeSchema.optional(),
				}),
			)
			.output(
				type<AsyncGenerator<UIMessageChunk<UIMessageMetadata, UIDataTypes>>>(),
			),
	},

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
				result: PermissionResultSchema,
			}),
		)
		.output(z.boolean()),
};
