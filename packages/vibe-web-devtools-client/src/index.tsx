import { EnvironmentProvider } from "@ark-ui/react/environment";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ToolbarProviders } from "@/context/toolbar";
import { App } from "./App";
import style from "./index.css?inline";

const MOUNT_ELEMENT_ID = "vibe-web-toolbar";

function mount() {
	const host = document.createElement(MOUNT_ELEMENT_ID);
	host.setAttribute("id", MOUNT_ELEMENT_ID);
	host.setAttribute("data-inspector-ignore", "true");
	document.body.appendChild(host);

	const shadowRoot = host.attachShadow({ mode: "open" });

	// style
	const shadowSheet = new CSSStyleSheet();
	shadowSheet.replaceSync(style.replace(/:root/gu, ":host"));
	shadowRoot.adoptedStyleSheets = [shadowSheet];

	// fix tailwindcss issue https://github.com/tailwindlabs/tailwindcss/issues/15005#issuecomment-2737489813
	const properties = [];
	for (const rule of shadowSheet.cssRules) {
		if (rule instanceof CSSPropertyRule) {
			if (rule.initialValue) {
				properties.push(`${rule.name}: ${rule.initialValue}`);
			}
		}
	}
	shadowSheet.insertRule(`:host { ${properties.join("; ")} }`);

	const container = document.createElement("div");
	shadowRoot.appendChild(container);
	createRoot(container).render(
		<StrictMode>
			<EnvironmentProvider value={shadowRoot}>
				<ToolbarProviders>
					<App />
				</ToolbarProviders>
			</EnvironmentProvider>
		</StrictMode>,
	);
}

mount();
