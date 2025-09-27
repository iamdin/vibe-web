import { implement } from "@orpc/server";
import type { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { toUIMessage } from "ai-sdk-claude-code";
import { claudeCodeContract } from "../contract/claude-code";

export type ClaudeCodeContext = {
	claudeCodeAgent: ClaudeCodeAgent;
};

const os = implement(claudeCodeContract);
const orpc = os.$context<ClaudeCodeContext>();

export const claudeCodeRouter = orpc.router({
	session: {
		create: orpc.session.create.handler(
			async ({ context: { claudeCodeAgent } }) => {
				return claudeCodeAgent.session.create();
			},
		),
		abort: orpc.session.abort.handler(
			async ({ input, context: { claudeCodeAgent } }) => {
				claudeCodeAgent.session.abort(input.sessionId);
			},
		),
	},
	prompt: orpc.prompt.handler(
		async ({ input, context: { claudeCodeAgent } }) => {
			const message: { type: "text"; text: string }[] = [];
			for (const part of input.message.parts || []) {
				switch (part.type) {
					case "text":
						message.push({
							type: "text",
							text: part.text,
						});
						break;
					case "data-inspector":
						message.push({
							type: "text",
							// @ts-expect-error TODO fix me
							text: `i am current inspect target: ${part.data.map((d) => `@${d.file}:${d.line}:${d.column}`).join(", ")}`,
						});
						break;
				}
			}
			return toUIMessage(
				claudeCodeAgent.session.prompt({
					sessionId: input.sessionId,
					message: {
						role: "user",
						content: message,
					},
				}),
			);
		},
	),
});

export type ClaudeCodeRouter = typeof claudeCodeRouter;
