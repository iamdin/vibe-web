import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { Routes } from "@vibe-web/server-trpc/routes";

const rpcUrl = new URL("/_vibe-web/rpc", window.location.origin).toString();

const link = new RPCLink({ url: rpcUrl });
export const orpc: RouterClient<Routes> = createORPCClient(link);
