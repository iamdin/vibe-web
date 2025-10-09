import {
	type InspectorRpcClientFunctions,
	type InspectorRpcServerFunctions,
	useInspectorRpcServer,
} from "@vibe-web/code-inspector-web";
import { type BirpcReturn, createBirpc } from "birpc";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createServerBirpcOption } from "@/lib/rpc/server";
import type { BuiltinFunctions } from "@/lib/rpc/type";

type RemoteFunctions = BuiltinFunctions & InspectorRpcClientFunctions;
type LocalFunctions = BuiltinFunctions & InspectorRpcServerFunctions;
export type ClientRpc = BirpcReturn<RemoteFunctions, LocalFunctions>;

export function useClientRpc() {
	const rpcRef = useRef({} as ClientRpc);
	const [connected, setConnected] = useState(false);

	const inspectorHandler = useInspectorRpcServer(
		useCallback(() => rpcRef.current, []),
	);

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
			rpc.$close();
			rpcRef.current = {} as ClientRpc;
		};
	}, [inspectorHandler]);

	return useMemo(
		() => ({
			rpcRef,
			connected,
		}),
		[connected],
	);
}
