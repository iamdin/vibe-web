import { Chat } from "@/components/chat";

export const Route = createFileRoute({
	component: RouteComponent,
});

function RouteComponent() {
	return <Chat />;
}
