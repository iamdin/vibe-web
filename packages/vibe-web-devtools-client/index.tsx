import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FloatingChat } from "@/components/floating-chat-panel";
import { ToolbarProviders, useToolbarContext } from "@/context/toolbar";

import "./src/index.css";

const container = document.createElement("div");
document.body.appendChild(container);
createRoot(container).render(
	<StrictMode>
		<ToolbarProviders defaultOpen>
			<App />
		</ToolbarProviders>
	</StrictMode>,
);

function App() {
	const { toolbarRef } = useToolbarContext();

	return (
		<>
			<FloatingChat />
			<div className="fixed bottom-5 right-5" ref={toolbarRef} />
		</>
	);
}
