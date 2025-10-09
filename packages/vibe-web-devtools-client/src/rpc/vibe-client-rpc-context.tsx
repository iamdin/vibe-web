import { createContext, useContext } from "react";
import { type RPC, useVibeClientRpc } from "./use-vibe-client-rpc";

export type VibeClientRpcContextType = {
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	rpcRef: React.RefObject<RPC>;
	connected: boolean;
};

const VibeClientRpcContext = createContext<VibeClientRpcContextType>(
	{} as VibeClientRpcContextType,
);

export function VibeClientRpcProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const context = useVibeClientRpc();

	return (
		<VibeClientRpcContext.Provider value={context}>
			{children}
		</VibeClientRpcContext.Provider>
	);
}

export const useVibeClientRpcContext = () => {
	const context = useContext(VibeClientRpcContext);
	if (!context) {
		throw new Error(
			"useVibeClientRpcContext must be used within a VibeClientRpcProvider",
		);
	}
	return context;
};
