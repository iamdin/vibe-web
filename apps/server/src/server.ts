import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { routes } from "@vibe-web/server-trpc/routes";
import cors from "cors";
import express from "express";

const app = express().use(cors());

const claudeCodeAgent = new ClaudeCodeAgent();
const nodeRPCHandler = new NodeRPCHandler(routes, {
	eventIteratorKeepAliveComment: "ping",
});

app.use(/\/api\/rpc*/, async (req, res, next) => {
	const { matched } = await nodeRPCHandler.handle(req, res, {
		prefix: "/api/rpc",
		context: { claudeCodeAgent },
	});
	if (matched) {
		return;
	}
	next();
});

app.listen(4000, () => {
	console.log("Server is running on http://localhost:4000");
});
