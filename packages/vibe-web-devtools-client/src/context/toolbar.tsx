import { InspectorProvider } from "@vibe-web/code-inspector-web";
import {
	type RefObject,
	createContext,
	useContext,
	useRef,
	useState,
} from "react";
import invariant from "tiny-invariant";

interface ToolbarContextType {
	toolbarRef: RefObject<HTMLDivElement>;
	open: boolean;
	setOpen: (open: boolean) => void;
}
const ToolbarContext = createContext<ToolbarContextType>(
	{} as ToolbarContextType,
);

interface ToolbarProvidersProps {
	defaultOpen?: boolean;
	children: React.ReactNode;
}

export const ToolbarProviders = ({
	defaultOpen,
	children,
}: ToolbarProvidersProps) => {
	const toolbarRef = useRef<HTMLDivElement>({} as HTMLDivElement);
	const [open, setOpen] = useState(defaultOpen ?? false);

	return (
		<ToolbarContext.Provider value={{ toolbarRef, open, setOpen }}>
			<InspectorProvider>{children}</InspectorProvider>
		</ToolbarContext.Provider>
	);
};

export const useToolbarContext = () => {
	const context = useContext(ToolbarContext);
	invariant(
		context,
		"useToolbarContext must be used within a ToolbarContextProvider",
	);
	return context;
};
