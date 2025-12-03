import type * as http from "node:http";
import type { HTTPPath } from "@orpc/server";
import { RPCHandler as FetchRPCHandler } from "@orpc/server/fetch";
import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";
import { RPCHandler as WsRPCHandler } from "@orpc/server/ws";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import type { WebSocket } from "ws";
import { router } from "./routes";
import type { ClaudeCodeContext } from "./routes/claude-code";

const RPC_PREFIX = "/api/rpc";
const claudeCodeAgent = new ClaudeCodeAgent();

export function createFetchRPCHandler() {
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
			prefix: RPC_PREFIX,
			context: {
				claudeCodeAgent,
			},
			...options,
		});
	};
}

export function createWsRPCHandler() {
	const wsHandler = new WsRPCHandler<ClaudeCodeContext>(router);

	return function upgrade(ws: WebSocket) {
		wsHandler.upgrade(ws, {
			context: {
				claudeCodeAgent,
			},
		});
	};
}
