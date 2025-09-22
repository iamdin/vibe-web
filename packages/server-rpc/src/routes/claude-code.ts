import { type } from "@orpc/server";
import type { UIMessage } from "ai";
import { toUIMessage } from "ai-sdk-claude-code";
import { z } from "zod/v4";
import { orpc } from "../orpc";

const session = orpc.router({
	abort: orpc
		.input(z.object({ sessionId: z.string() }))
		.handler(async ({ input, context: { claudeCodeAgent } }) => {
			claudeCodeAgent.session.abort(input.sessionId);
		}),
	create: orpc
		.output(
			z.object({
				sessionId: z.string(),
			}),
		)
		.handler(async ({ context: { claudeCodeAgent } }) => {
			return claudeCodeAgent.session.create();
		}),
});

const prompt = orpc
	.input(
		type<{
			sessionId: string;
			message: UIMessage;
		}>(),
	)
	.handler(async ({ input, context: { claudeCodeAgent } }) => {
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
	});

export const claudeCode = {
	session,
	prompt,
};
