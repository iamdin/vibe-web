import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import Loader from "@/components/loader";
import type { orpc } from "@/lib/orpc";

import appCss from "../index.css?url";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Vibe Web",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const isFetching = useRouterState({ select: (s) => s.isLoading });
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{/* <SidebarProvider> */}
				<div className="flex h-svh w-full">
					{/* <AppSidebar /> */}
					<main className="flex-1 overflow-hidden">
						{isFetching ? <Loader /> : <Outlet />}
					</main>
				</div>
				{/* </SidebarProvider> */}
				{/* <TanStackRouterDevtools position="bottom-left" /> */}
				{/* <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" /> */}
				<Scripts />
			</body>
		</html>
	);
}
