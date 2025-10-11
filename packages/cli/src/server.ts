import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { router } from "@vibe-web/server-rpc/routes";
import cors from "cors";
import express from "express";

const app = express().use(cors());

app.get("/health", (_, res) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

const claudeCodeAgent = new ClaudeCodeAgent();
const nodeRPCHandler = new NodeRPCHandler(router, {
	eventIteratorKeepAliveComment: "ping",
})
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticRoot = path.resolve(__dirname, "../../../apps/web/.output/public");

app.use(express.static(staticRoot));
app.get("/{*splat}", (_, res) => {
	const shellPath = path.join(staticRoot, "_shell.html");
	if (!existsSync(shellPath)) {
		console.error("Shell template missing at", shellPath);
		res.status(404).send("Shell template not found");
		return;
	}
	res.sendFile("_shell.html", { root: staticRoot });
});


app.listen(4000, () => {
	console.log("Server is running on http://localhost:4000");
});
