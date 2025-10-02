import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/vibe/app";
import { VibeRpcProvider } from "./rpc/vibe-rpc-provider";

import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: exist
const container = document.getElementById("root")!;
document.body.appendChild(container);

createRoot(container).render(
	<StrictMode>
		<VibeRpcProvider>
			<App />
		</VibeRpcProvider>
	</StrictMode>,
);
