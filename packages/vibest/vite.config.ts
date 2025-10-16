import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
// import vibeWebDevtools from "vibe-web-devtools/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	base: "./",
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src/client", import.meta.url)),
		},
	},
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
			routesDirectory: "./src/client/routes",
		}),
	],
});
