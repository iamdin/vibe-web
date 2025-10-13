#!/usr/bin/env node

import { createServer } from "./server";

async function main() {
	const server = createServer();

	server.listen(4000, () => {
		console.log("Server is running on port 4000");
	});
}

main();
