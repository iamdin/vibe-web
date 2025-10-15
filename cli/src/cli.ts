#!/usr/bin/env node

import { serve } from "@hono/node-server";
import { createServer } from "./server";

const app = createServer();
const server = serve({
	fetch: app.fetch,
	port: 4000,
});

// graceful shutdown
process.on("SIGINT", () => {
	server.close();
	process.exit(0);
});
process.on("SIGTERM", () => {
	server.close((err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		process.exit(0);
	});
});
