import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	define: {
		"process.env.NODE_ENV": JSON.stringify(mode),
	},
	build: {
		minify: mode !== "development" ? "oxc" : false,
		target: "esnext",
	},
	experimental: {
		enableNativePlugin: true,
	},
}));
