import { createRequire } from "node:module";
import path, { extname } from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { createFetchRPCHandler } from "@vibe-web/server-rpc";
import { Hono } from "hono";

const require = createRequire(import.meta.url);
const staticRoot = path.resolve(
	path.dirname(require.resolve("@vibest/web/package.json")),
	"dist",
);

export function createServer() {
	const handler = createFetchRPCHandler();
	const app = new Hono();
	app
		.get("/api/health", (c) => c.json({ status: "ok" }))
		.use("/api/rpc/*", async (c, next) => {
			const { matched, response } = await handler(c.req.raw, {
				prefix: "/api/rpc",
			});

			if (matched) {
				return c.newResponse(response.body, response);
			}

			await next();
		})
		.use(
			"*",
			serveStatic({
				root: staticRoot,
				rewriteRequestPath: (requestPath) =>
					extname(requestPath) ? requestPath : "/index.html",
			}),
		);

	return app;
}
