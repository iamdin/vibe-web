import {
	CodeBlock,
	CodeBlockCopyButton,
} from "@vibe-web/ui/ai-elements/code-block";
import { Response } from "@vibe-web/ui/ai-elements/response";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import {
	isToolUIPart,
	type ToolUIPart,
	type UIDataTypes,
	type UIMessage,
} from "ai";
import type {
	BashUIToolInvocation,
	ClaudeCodeTools,
	EditUIToolInvocation,
	GrepUIToolInvocation,
	ReadUIToolInvocation,
	TaskUIToolInvocation,
	WebFetchUIToolInvocation,
	WebSearchUIToolInvocation,
} from "ai-sdk-claude-code";
import {
	EditIcon,
	FileTextIcon,
	GlobeIcon,
	ListChecksIcon,
	SearchIcon,
	TerminalIcon,
} from "lucide-react";
import { useMemo } from "react";

export function ClaudeCodeToolUIPart({
	message,
	part,
}: {
	message: UIMessage<unknown, UIDataTypes, ClaudeCodeTools>;
	part: ToolUIPart<ClaudeCodeTools>;
}) {
	if (
		!part ||
		part.state === "input-streaming" ||
		part.callProviderMetadata?.claudeCode?.parentToolUseId
	) {
		return null;
	}

	return (
		<ClaudeCodeToolUIPartComponent
			key={part.toolCallId}
			message={message}
			part={part}
		/>
	);
}

function ClaudeCodeToolUIPartComponent({
	message,
	part,
}: {
	message: UIMessage<unknown, UIDataTypes, ClaudeCodeTools>;
	part: ToolUIPart<ClaudeCodeTools>;
}) {
	// task tool renders nested tools
	if (part.type === "tool-Task") {
		return <ClaudeCodeTaskTool message={message} invocation={part} />;
	}

	switch (part.type) {
		case "tool-Bash":
			return <ClaudeCodeBashTool invocation={part} />;
		case "tool-Read":
			return <ClaudeCodeReadTool invocation={part} />;
		case "tool-Grep":
			return <ClaudeCodeGrepTool invocation={part} />;
		case "tool-Edit":
			return <ClaudeCodeEditTool invocation={part} />;
		case "tool-WebFetch":
			return <ClaudeCodeWebFetchTool invocation={part} />;
		case "tool-WebSearch":
			return <ClaudeCodeWebSearchTool invocation={part} />;
		default:
			return null;
	}
}

export function ClaudeCodeTaskTool({
	message,
	invocation,
}: {
	message: UIMessage<unknown, UIDataTypes, ClaudeCodeTools>;
	invocation: TaskUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	const childrenToolUIParts = useMemo(
		() =>
			message.parts
				.filter((part) => {
					if (!isToolUIPart(part)) return false;
					return (
						part.type !== "tool-Task" &&
						part.state !== "input-streaming" &&
						part.callProviderMetadata?.claudeCode?.parentToolUseId ===
							invocation.toolCallId // this cause not type safe
					);
				})
				.filter((part) => isToolUIPart(part)),
		[message.parts, invocation.toolCallId],
	);

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={ListChecksIcon}>
				<span className="truncate font-medium text-sm">
					Task {input?.description}
				</span>
			</ToolHeader>
			<ToolContent className="space-y-2">
				<Response>{input?.prompt}</Response>
				{childrenToolUIParts.map((part) => {
					return (
						<ClaudeCodeToolUIPartComponent
							key={part.toolCallId}
							message={message}
							part={part}
						/>
					);
				})}
				{Array.isArray(output)
					? output.map((part) => {
							switch (part.type) {
								case "text":
									return (
										<div key={part.text}>
											<Response>{part.text}</Response>
										</div>
									);
								default:
									return null;
							}
						})
					: null}
			</ToolContent>
		</Tool>
	);
}

export function ClaudeCodeBashTool({
	invocation,
}: {
	invocation: BashUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={TerminalIcon}>
				<span className="truncate font-medium text-sm">
					Bash {input?.description}
				</span>
			</ToolHeader>
			<ToolContent>
				{input?.command ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Command
						</h4>
						<CodeBlock
							code={input.command}
							language="bash"
							className="text-sm"
						/>
					</div>
				) : null}
				{output ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Output
						</h4>
						<CodeBlock code={output} language="bash" className="text-sm" />
					</div>
				) : null}
			</ToolContent>
		</Tool>
	);
}

export function ClaudeCodeReadTool({
	invocation,
}: {
	invocation: ReadUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	const code = output?.replace(/^\s*(\d+)→/gm, "");
	const language = input?.file_path?.match(/\.(\w+)$/)?.[1] || "text";

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={FileTextIcon}>
				<span className="truncate font-medium text-sm">
					Read {input?.file_path}
				</span>
			</ToolHeader>
			<ToolContent>
				{code ? (
					<CodeBlock code={code} language={language} className="text-xs">
						<CodeBlockCopyButton />
					</CodeBlock>
				) : null}
			</ToolContent>
		</Tool>
	);
}

export function ClaudeCodeGrepTool({
	invocation,
}: {
	invocation: GrepUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={SearchIcon}>
				<span className="truncate font-medium text-sm">
					Grep {input?.pattern}
				</span>
			</ToolHeader>
			<ToolContent>
				{typeof output === "string" ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Results
						</h4>
						<CodeBlock code={output} language="json" className="text-xs" />
					</div>
				) : null}
			</ToolContent>
		</Tool>
	);
}

export function ClaudeCodeEditTool({
	invocation,
}: {
	invocation: EditUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={EditIcon}>
				<span className="truncate font-medium text-sm">
					Edit {input?.file_path}
				</span>
			</ToolHeader>
			<ToolContent>
				{input?.old_string ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Old String
						</h4>
						<CodeBlock
							code={input.old_string}
							language="text"
							className="text-xs"
						/>
					</div>
				) : null}
				{input?.new_string ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							New String
						</h4>
						<CodeBlock
							code={input.new_string}
							language="text"
							className="text-xs"
						/>
					</div>
				) : null}
			</ToolContent>
		</Tool>
	);
}

export function ClaudeCodeWebFetchTool({
	invocation,
}: {
	invocation: WebFetchUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={GlobeIcon}>
				<span className="truncate font-medium text-sm">
					WebFetch {input?.url}
				</span>
			</ToolHeader>
			<ToolContent>
				{input?.url ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							URL
						</h4>
						<CodeBlock code={input.url} language="text" className="text-sm" />
					</div>
				) : null}
				{input?.prompt ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Prompt
						</h4>
						<CodeBlock
							code={input.prompt}
							language="text"
							className="text-sm"
						/>
					</div>
				) : null}
				{output ? (
					<div className="space-y-2 px-4 pb-4">
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Result
						</h4>
						<Response>{output}</Response>
					</div>
				) : null}
			</ToolContent>
		</Tool>
	);
}

export function ClaudeCodeWebSearchTool({
	invocation,
}: {
	invocation: WebSearchUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={SearchIcon}>
				<span className="truncate font-medium text-sm">
					WebSearch "{input?.query}"
				</span>
			</ToolHeader>
			<ToolContent>{output ? <Response>{output}</Response> : null}</ToolContent>
		</Tool>
	);
}
