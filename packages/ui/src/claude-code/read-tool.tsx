import {
	CodeBlock,
	CodeBlockCopyButton,
} from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { ReadUIToolInvocation } from "ai-sdk-claude-code";
import { FileTextIcon } from "lucide-react";

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
