import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig(({ mode }) => {
	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				...resolveESM([
					"react",
					"react-dom",
					"react-markdown",
					"shiki",
					"@xstate/store",
					"@orpc/client",
					"@floating-ui/react",
					"hast-util-to-jsx-runtime",
					"birpc",
					"class-variance-authority",
					"clsx",
					"lucide-react",
					"motion",
					"tailwind-merge",
					"use-stick-to-bottom",
				]),
			},
		},
		build: {
			minify: mode !== "development",
			lib: {
				entry: "src/client.tsx",
				fileName: "client",
				formats: ["es"],
			},
			outDir: "../vibe-web-devtools/dist",
		},
		experimental: {
			enableNativePlugin: true,
		},
	};
});

function resolveESM(deps: (keyof typeof pkg.dependencies)[]) {
	return deps.reduce(
		(acc, key) => {
			acc[key] = `https://esm.sh/${key}@${pkg.dependencies[key]}`;
			return acc;
		},
		{} as Record<string, string>,
	);
}
