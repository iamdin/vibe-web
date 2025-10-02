import type {
	InspectorRpcDispatch,
	InspectorRpcListener,
} from "@vibe-web/code-inspector-web";
import { useInspectorRpcClient } from "@vibe-web/code-inspector-web";
import { type BirpcReturn, createBirpc } from "birpc";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClientBirpcOption } from "@/lib/message/client";
import type { HostFunctions, IframeFunctions } from "@/lib/message/type";

type RemoteFunctions = IframeFunctions & InspectorRpcDispatch;
type LocalFunctions = HostFunctions & InspectorRpcListener;
type RPC = BirpcReturn<RemoteFunctions, LocalFunctions>;

type VibeRpcContextType = {
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	rpcRef: React.RefObject<RPC>;
	connected: boolean;
};

const VibeRpcContext = createContext<VibeRpcContextType>(
	{} as VibeRpcContextType,
);

export function useVibeRpc() {
	const context = useContext(VibeRpcContext);
	if (!context) {
		throw new Error("useVibeRpc must be used within VibeRpcProvider");
	}
	return context;
}

export function VibeRpcProvider({ children }: { children: React.ReactNode }) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const rpcRef = useRef({} as RPC);
	const [connected, setConnected] = useState(false);

	const inspectorRpcListener = useInspectorRpcClient({
		enable: connected,
	});

	useEffect(() => {
		if (!iframeRef.current || !iframeRef.current.contentWindow) return;

		// Create RPC connection
		const rpc = createBirpc<RemoteFunctions, LocalFunctions>(
			{
				connect: async () => {
					rpcRef.current = rpc;
					setConnected(true);
					console.log("host connected");
					return true;
				},
				...inspectorRpcListener,
			},
			createClientBirpcOption(iframeRef.current),
		);

		return () => {
			rpcRef.current = {} as RPC;
		};
	}, [inspectorRpcListener]);

	const context = {
		rpcRef,
		iframeRef,
		connected,
	};

	return (
		<VibeRpcContext.Provider value={context}>
			{children}
		</VibeRpcContext.Provider>
	);
}
