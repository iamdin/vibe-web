import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/node/cli.ts"],
	platform: "node",
	external: ["vite"],
});
