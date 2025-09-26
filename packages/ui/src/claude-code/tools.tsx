import type {
	BashUIToolInvocation,
	EditUIToolInvocation,
	GrepUIToolInvocation,
	ReadUIToolInvocation,
	TaskUIToolInvocation,
} from "ai-sdk-claude-code";
import {
	EditIcon,
	FileTextIcon,
	ListChecksIcon,
	SearchIcon,
	TerminalIcon,
} from "lucide-react";
import { CodeBlock, CodeBlockCopyButton } from "../ai-elements/code-block";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../components/collapsible";

export function ClaudeCodeBashTool({
	invocation,
}: {
	invocation: BashUIToolInvocation;
}) {
	if (!invocation) return null;

	const { input, output } = invocation;

	return (
		<Collapsible className="not-prose w-full">
			<CollapsibleTrigger className="flex w-full items-center gap-2 p-1">
				<TerminalIcon className="flex-shrink-0 size-3" />
				<span className="truncate">Bash {input?.description}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="p-2 space-y-2">
				{input?.command ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Command
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock
								code={input.command}
								language="bash"
								className="text-sm"
							/>
						</div>
					</div>
				) : null}
				{output ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Output
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock code={output} language="bash" className="text-sm" />
						</div>
					</div>
				) : null}
			</CollapsibleContent>
		</Collapsible>
	);
}

export function ClaudeCodeReadTool({
	invocation,
}: {
	invocation: ReadUIToolInvocation;
}) {
	if (!invocation) return null;

	const { input, output } = invocation;

	const code = output?.replace(/^\s*(\d+)→/gm, "");
	const language = input?.file_path?.match(/\.(\w+)$/)?.[1] || "text";

	return (
		<Collapsible className="not-prose w-full">
			<CollapsibleTrigger className="flex w-full items-center gap-2 p-1 ">
				<FileTextIcon className="flex-shrink-0 size-3" />
				<span className="truncate">Read {input?.file_path}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="p-2 space-y-2">
				{code ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Content
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock code={code} language={language} className="text-xs">
								<CodeBlockCopyButton />
							</CodeBlock>
						</div>
					</div>
				) : null}
			</CollapsibleContent>
		</Collapsible>
	);
}

export function ClaudeCodeGrepTool({
	invocation,
}: {
	invocation: GrepUIToolInvocation;
}) {
	if (!invocation) return null;
	const { input, output } = invocation;

	return (
		<Collapsible className="not-prose w-full">
			<CollapsibleTrigger className="flex w-full items-center gap-2 p-1">
				<SearchIcon className="flex-shrink-0 size-3" />
				<span className="truncate">Grep {input?.pattern}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="p-2 space-y-2">
				{typeof output === "string" ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Results
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock code={output} language="json" className="text-xs" />
						</div>
					</div>
				) : null}
			</CollapsibleContent>
		</Collapsible>
	);
}

export function ClaudeCodeEditTool({
	invocation,
}: {
	invocation: EditUIToolInvocation;
}) {
	if (!invocation) return null;

	const { input } = invocation;

	return (
		<Collapsible className="not-prose w-full">
			<CollapsibleTrigger className="flex w-full items-center gap-2 p-1">
				<EditIcon className="flex-shrink-0 size-3" />
				<span className="truncate">Edit {input?.file_path}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="p-2 space-y-2">
				{input?.old_string ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Old String
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock
								code={input.old_string}
								language="text"
								className="text-xs"
							/>
						</div>
					</div>
				) : null}
				{input?.new_string ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							New String
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock
								code={input.new_string}
								language="text"
								className="text-xs"
							/>
						</div>
					</div>
				) : null}
			</CollapsibleContent>
		</Collapsible>
	);
}

export function ClaudeCodeTaskTool({
	invocation,
}: {
	invocation: TaskUIToolInvocation;
}) {
	if (!invocation) return null;
	const { input, output } = invocation;

	return (
		<Collapsible className="not-prose w-full">
			<CollapsibleTrigger className="flex w-full items-center gap-2 p-1">
				<ListChecksIcon className="flex-shrink-0 size-3" />
				<span className="truncate">Task {input?.description}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="p-2 space-y-2">
				{input?.prompt ? (
					<div className="space-y-2 overflow-hidden px-2">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Prompt
						</h4>
						<div className="rounded-md bg-muted/50">
							<CodeBlock
								code={input.prompt}
								language="markdown"
								className="text-xs"
							/>
						</div>
					</div>
				) : null}
				<div className="space-y-2 overflow-hidden px-2">
					<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Result
					</h4>
					<div className="rounded-md bg-muted/50">
						{Array.isArray(output)
							? output.map((part) => {
									switch (part.type) {
										case "text":
											return (
												<CodeBlock
													key={part.text}
													code={part.text}
													language="markdown"
													className="text-xs"
												/>
											);
										default:
											return null;
									}
								})
							: null}
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
