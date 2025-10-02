import {
	type InspectorRpcDispatch,
	type InspectorRpcListener,
	useInspectorRpcHandler,
} from "@vibe-web/code-inspector-web";
import { type BirpcReturn, createBirpc } from "birpc";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { HostFunctions, IframeFunctions } from "@/lib/message/type";
import { createServerBirpcOption } from "../lib/message/server";

type RemoteFunctions = HostFunctions & InspectorRpcListener;
type LocalFunctions = IframeFunctions & InspectorRpcDispatch;
type RPC = BirpcReturn<RemoteFunctions, LocalFunctions>;

type ClientRpcContextType = {
	connected: boolean;
	rpcRef: React.RefObject<RPC>;
};

const ClientRpcContext = createContext<ClientRpcContextType>(
	{} as ClientRpcContextType,
);

export function ClientRpcProvider({ children }: React.PropsWithChildren) {
	const rpcRef = useRef({} as BirpcReturn<RemoteFunctions, LocalFunctions>);
	const [connected, setConnected] = useState(false);

	const inspectorHandler = useInspectorRpcHandler(() => rpcRef.current, {
		enable: connected,
	});

	useEffect(() => {
		const rpc = createBirpc<RemoteFunctions, LocalFunctions>(
			{
				...inspectorHandler,
				connect: async () => true,
			},
			createServerBirpcOption(),
		);

		rpc.connect().then((result) => {
			console.log("client rpc connection", result);
			if (result) {
				rpcRef.current = rpc;
				setConnected(result);
			}
		});

		return () => {
			rpcRef.current = {} as RPC;
		};
	}, [inspectorHandler]);

	const context = {
		rpcRef,
		connected,
	};

	return (
		<ClientRpcContext.Provider value={context}>
			{children}
		</ClientRpcContext.Provider>
	);
}

export function useClientRpc() {
	const context = useContext(ClientRpcContext);
	if (!context) {
		throw new Error("useClientRpc must be used within ClientRpcProvider");
	}
	return context;
}
