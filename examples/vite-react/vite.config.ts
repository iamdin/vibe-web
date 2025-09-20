import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import vibeWeb from "vibe-web-devtools/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	server: {
		port: 5173,
	},
	plugins: [
    tanstackRouter({
      target: "react",
			autoCodeSplitting: true,
		}),
    vibeWeb(),
		react(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),

			// fix loading all icon chunks in dev mode
			// https://github.com/tabler/tabler-icons/issues/1233
			"@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
		},
	},
});
