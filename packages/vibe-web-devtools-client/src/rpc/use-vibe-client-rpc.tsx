import type {
	InspectorRpcClientFunctions,
	InspectorRpcServerFunctions,
} from "@vibe-web/code-inspector-web";
import { useInspectorRpcClient } from "@vibe-web/code-inspector-web";
import { type BirpcReturn, createBirpc } from "birpc";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClientBirpcOption } from "@/lib/rpc/client";
import type { BuiltinFunctions } from "@/lib/rpc/type";

/** for vibe client, treat host as client, iframe as server */
type RemoteFunctions = BuiltinFunctions & InspectorRpcServerFunctions;
type LocalFunctions = BuiltinFunctions & InspectorRpcClientFunctions;
export type RPC = BirpcReturn<RemoteFunctions, LocalFunctions>;

export function useVibeClientRpc() {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const rpcRef = useRef({} as RPC);
	const [connected, setConnected] = useState(false);

	const inspectorHandler = useInspectorRpcClient(
		useCallback(() => rpcRef.current, []),
	);

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
				...inspectorHandler,
			},
			createClientBirpcOption(iframeRef.current),
		);

		return () => {
			rpcRef.current = {} as RPC;
		};
	}, [inspectorHandler]);

	return useMemo(
		() => ({
			rpcRef,
			iframeRef,
			connected,
		}),
		[connected],
	);
}
