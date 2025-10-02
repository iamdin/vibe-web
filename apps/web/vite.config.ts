import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
import vibeWebDevtools from "vibe-web-devtools/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		codeInspectorPlugin({ bundler: "vite" }),
		vibeWebDevtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart({
			target: "static",
			client: {
				entry: "./client.tsx",
			},
			spa: {
				enabled: true,
			},
			tsr: {
				verboseFileRoutes: false,
			},
			customViteReactPlugin: true,
		}),
		viteReact(),
	],
});
