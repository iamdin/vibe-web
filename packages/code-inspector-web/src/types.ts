export interface InspectMetadata {
	fileName?: string;
	lineNumber?: number;
	columnNumber?: number;
	componentName: string;
}

export interface InspectedTarget {
	id: string;
	element: HTMLElement;
	metadata: InspectMetadata;
}

export type InspectedTargetData = Pick<InspectedTarget, "id" | "metadata">;
