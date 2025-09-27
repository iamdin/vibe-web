import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import type { Router } from "@vibe-web/server-trpc/routes";
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

const getClientLink = createIsomorphicFn()
	.client(() => {
		return new RPCLink({
			url: `${import.meta.env.VITE_SERVER_URL}/api/rpc`,
		});
	})
	.server(
		() =>
			new RPCLink({
				url: `${import.meta.env.VITE_SERVER_URL}/api/rpc`,
			}),
	);

export const orpcClient: RouterClient<Router> = createORPCClient(
	getClientLink(),
);

export const orpc = createTanstackQueryUtils({
	orpcClient,
});
