import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { WriteUIToolInvocation } from "ai-sdk-claude-code";
import { FileTextIcon } from "lucide-react";

export function ClaudeCodeWriteTool({
	invocation,
}: {
	invocation: WriteUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input } = invocation;

	const language = input?.file_path?.match(/\.(\w+)$/)?.[1] || "text";

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={FileTextIcon}>
				<span className="truncate font-medium text-sm">
					Write {input?.file_path}
				</span>
			</ToolHeader>
			<ToolContent>
				{input?.content ? (
					<CodeBlock
						code={input.content}
						language={language}
						className="text-xs"
					/>
				) : null}
			</ToolContent>
		</Tool>
	);
}
