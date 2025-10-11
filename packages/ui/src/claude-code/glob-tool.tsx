import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { GlobUIToolInvocation } from "ai-sdk-agents/claude-code";
import { FolderSearchIcon } from "lucide-react";

export function ClaudeCodeGlobTool({
	invocation,
}: {
	invocation: GlobUIToolInvocation;
}) {
	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool>
			<ToolHeader icon={FolderSearchIcon}>
				<span className="truncate font-medium text-sm">
					Glob for {input?.pattern ? `"${input.pattern}"` : ""}
					{input?.path ? ` in ${input.path}` : ""}
				</span>
			</ToolHeader>
			<ToolContent>
				{typeof output === "string" ? (
					<CodeBlock code={output} language="text" className="text-sm" />
				) : null}
			</ToolContent>
		</Tool>
	);
}
