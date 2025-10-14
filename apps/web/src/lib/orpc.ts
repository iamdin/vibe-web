import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import type { Router } from "@vibe-web/server-rpc/routes";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

const serverUrl = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "");
const rpcUrl = serverUrl ? `${serverUrl}/api/rpc` : "/api/rpc";

const rpcLink = new RPCLink({
	url: rpcUrl,
});

export const orpcClient: RouterClient<Router> = createORPCClient(rpcLink);

export const orpc = createTanstackQueryUtils({
	orpcClient,
});
