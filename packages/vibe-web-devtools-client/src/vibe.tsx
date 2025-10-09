import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/vibe/app";
import { VibeClientRpcProvider } from "./rpc/vibe-client-rpc-context";

import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: exist
const container = document.getElementById("root")!;
document.body.appendChild(container);

createRoot(container).render(
	<StrictMode>
		<VibeClientRpcProvider>
			<App />
		</VibeClientRpcProvider>
	</StrictMode>,
);
