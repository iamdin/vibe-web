import { RPCHandler } from "@orpc/server/fetch";
import { ClaudeCodeAgent } from "@vibe-web/agents/claude-code";
import { routes } from "@vibe-web/server-trpc/routes";

const handler = new RPCHandler(routes);
const claudeCodeAgent = new ClaudeCodeAgent();

async function handle({ request }: { request: Request }) {
	const { response } = await handler.handle(request, {
		prefix: "/api/rpc",
		context: { claudeCodeAgent },
	});

	return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute().methods({
	HEAD: handle,
	GET: handle,
	POST: handle,
	PUT: handle,
	PATCH: handle,
	DELETE: handle,
});
