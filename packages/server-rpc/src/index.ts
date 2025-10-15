import type * as http from "node:http";
import type { HTTPPath } from "@orpc/server";
import { RPCHandler as FetchRPCHandler } from "@orpc/server/fetch";
import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { router } from "./routes";

export function createFetchRPCHandler() {
	const claudeCodeAgent = new ClaudeCodeAgent();
	const rpcHandler = new FetchRPCHandler(router, {
		eventIteratorKeepAliveComment: "ping",
	});

	return async function handler(
		request: Request,
		options?: {
			prefix?: HTTPPath;
		},
	) {
		return rpcHandler.handle(request, {
			prefix: "/api/rpc",
			context: { claudeCodeAgent },
			...options,
		});
	};
}

export function createNodeRPCHandler() {
	const claudeCodeAgent = new ClaudeCodeAgent();
	const rpcHandler = new NodeRPCHandler(router, {
		eventIteratorKeepAliveComment: "ping",
	});

	return async function handler(
		request: http.IncomingMessage,
		response: http.ServerResponse,
		options?: {
			prefix?: HTTPPath;
		},
	) {
		return rpcHandler.handle(request, response, {
			prefix: "/api/rpc",
			context: { claudeCodeAgent },
			...options,
		});
	};
}
