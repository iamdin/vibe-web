import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
	base: "__vibe",
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	build: {
		minify: mode !== "development" ? "oxc" : false,
		target: "esnext",
		outDir: fileURLToPath(
			new URL("../vibe-web-devtools/dist/vibe", import.meta.url),
		),
	},
	experimental: {
		enableNativePlugin: true,
	},
}));
