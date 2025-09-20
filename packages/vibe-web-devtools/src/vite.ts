import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { routes } from "@vibe-web/server-trpc/routes";
import invariant from "tiny-invariant";
import type { Plugin, ViteDevServer } from "vite";
import { transformHandler } from "./transform";

const CLIENT_PUBLIC_PATH = "/@vibe-web/client";

export default function (): Plugin {
	let _server: ViteDevServer;

	const claudeCodeAgent = new ClaudeCodeAgent();
	const nodeRPCHandler = new NodeRPCHandler(routes, {
		eventIteratorKeepAliveComment: "ping",
	});

	return {
		name: "vite-plugin-vibe-web-dev",
		enforce: "pre",
		configureServer(server) {
			_server = server;
			server.middlewares.use("/_viweb/rpc", async (req, res, next) => {
				const { matched } = await nodeRPCHandler.handle(req, res, {
					prefix: "/_viweb/rpc",
					context: { claudeCodeAgent },
				});
				if (!matched) {
					return next();
				}
			});
		},
		transformIndexHtml(html) {
			return {
				html,
				tags: [
					{
						tag: "script",
						injectTo: "head",
						attrs: { type: "module", src: CLIENT_PUBLIC_PATH },
					},
				],
			};
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
			handler(code, id) {
				return transformHandler(id, code, {
					rootPath: process.cwd(),
					absolutePath: id.split("?", 2)[0],
				});
			},
		},
	};
}

function replaceDefine(code: string, define: { [key: string]: string }) {
	return Object.keys(define).reduce((acc, key) => {
		return acc.replace(key, define[key as keyof typeof define]);
	}, code);
}
