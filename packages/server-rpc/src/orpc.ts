import { os } from "@orpc/server";
import type { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";

export type ORPCContext = {
	claudeCodeAgent: ClaudeCodeAgent;
};

export const orpc = os.$context<ORPCContext>();
