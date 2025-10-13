import path from "node:path";
import { fileURLToPath } from "node:url";
import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { staticPlugin } from "@elysiajs/static";
import { RPCHandler } from "@orpc/server/fetch";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { router } from "@vibe-web/server-rpc/routes";
import { Elysia, file } from "elysia";

const isBun = typeof Bun !== "undefined";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticRoot = path.resolve(__dirname, "../../apps/web/.output/public");

export function createServer() {
	const claudeCodeAgent = new ClaudeCodeAgent();
	const rpcHandler = new RPCHandler(router, {
		plugins: [],
		eventIteratorKeepAliveComment: "ping",
	});

	return (
		new Elysia({
			adapter: isBun ? undefined : node(),
		})
			.use(cors())
			.get("/api/health", () => ({
				status: "ok",
				timestamp: new Date().toISOString(),
			}))
			.all(
				"/api/rpc*",
				async ({ request }) => {
					const { response } = await rpcHandler.handle(request, {
						prefix: "/api/rpc",
						context: { claudeCodeAgent },
					});
					return response ?? new Response("Not Found", { status: 404 });
				},
				{
					parse: "none", // Disable Elysia body parser to prevent "body already used" error
				},
			)
			// Static file serving (handles /assets/* and other static files)
			.use(
				staticPlugin({
					assets: staticRoot,
					prefix: "/",
					indexHTML: false,
					ignorePatterns: ["_shell.html"],
				}),
			)
			// SPA fallback - serve _shell.html for all unmatched routes
			.onError(({ code, set }) => {
				if (code === "NOT_FOUND") {
					set.status = 200;
					set.headers["content-type"] = "text/html; charset=utf-8";
					return file(path.join(staticRoot, "_shell.html"));
				}
			})
	);
}
