export const ServerRoute = createServerFileRoute().methods({
	GET: async () => {
		return new Response(JSON.stringify({ message: "Hello, World!" }), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	},
});
