import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { createNodeRPCHandler } from "@vibe-web/server-rpc";
import react from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
// import vibeWebDevtools from "vibe-web-devtools/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	base: "./",
	plugins: [
		codeInspectorPlugin({ bundler: "vite" }),
		// vibeWebDevtools(),
		react(),
		tailwindcss(),
		tsconfigPaths(),
		tanstackRouter({
			target: "react",
			verboseFileRoutes: false,
			autoCodeSplitting: true,
		}),
		{
			name: "vite-dev",
			configureServer(server) {
				const handler = createNodeRPCHandler();
				server.middlewares.use(async (req, res, next) => {
					const { matched } = await handler(req, res);
					if (!matched) {
						return next();
					}
				});
			},
		},
	],
});
