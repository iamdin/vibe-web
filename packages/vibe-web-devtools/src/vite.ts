import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { router } from "@vibe-web/server-trpc/routes";
import sirv from "sirv";
import invariant from "tiny-invariant";
import type { Plugin, ViteDevServer } from "vite";
import { transformHandler } from "./transform";

const CLIENT_PUBLIC_PATH = "/@vibe-web/client";

export const DIR_DIST =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

export const DIR_PLAY = path.resolve(DIR_DIST, "../dist/vibe");

export default function (): Plugin[] {
	let _server: ViteDevServer;

	const claudeCodeAgent = new ClaudeCodeAgent();
	const nodeRPCHandler = new NodeRPCHandler(router, {
		eventIteratorKeepAliveComment: "ping",
	});

	return [
		{
			name: "vibe-web-devtools",
			enforce: "pre",
			apply: "serve",
			configureServer(server) {
				_server = server;
				const base = server.config.base || "/";

				server.middlewares.use(`${base}__vibe/rpc`, async (req, res, next) => {
					const { matched } = await nodeRPCHandler.handle(req, res, {
						prefix: "/__vibe/rpc",
						context: { claudeCodeAgent },
					});
					if (!matched) {
						return next();
					}
				});

				server.middlewares.use(
					`${base}__vibe`,
					sirv(DIR_PLAY, {
						single: true,
						dev: true,
					}),
				);
			},
			async load(id) {
				if (id === CLIENT_PUBLIC_PATH) {
					const content = await fs.readFile(
						fileURLToPath(new URL("./client.js", import.meta.url)),
						"utf-8",
					);
					invariant(
						_server.resolvedUrls?.local?.[0],
						"dev server local url is not found",
					);
					return replaceDefine(content, {
						"process.env.VIWEB_LOCAL_URL": JSON.stringify(
							_server.resolvedUrls.local[0],
						),
						"process.env.VIWEB_WORKSPACE_PATH": JSON.stringify(process.cwd()),
						"process.env.VIWEB_ROOT_PATH": JSON.stringify(process.cwd()),
					});
				}
			},
			transform: {
				filter: {
					id: { exclude: [/node_modules/], include: /\.(jsx|tsx|vue)$/ },
				},
				async handler(code, id) {
					const result = transformHandler(id, code, {
						rootPath: process.cwd(),
						absolutePath: id.split("?", 2)[0],
					});

					if (!result) return undefined;
					return result;
				},
			},
		},
		{
			name: "vibe-web-devtools-client",
			apply: "serve",
			enforce: "post",
			transformIndexHtml(html) {
				return {
					html,
					tags: [
						{
							tag: "script",
							injectTo: "head",
							attrs: { type: "module", defer: true, src: CLIENT_PUBLIC_PATH },
						},
					],
				};
			},
		},
	];
}

function replaceDefine(code: string, define: { [key: string]: string }) {
	return Object.keys(define).reduce((acc, key) => {
		return acc.replace(key, define[key as keyof typeof define]);
	}, code);
}
