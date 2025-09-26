import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart({
			target: "static",
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
