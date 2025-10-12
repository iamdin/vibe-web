import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { GrepUIToolInvocation } from "ai-sdk-agents/claude-code";
import { SearchIcon } from "lucide-react";

export function ClaudeCodeGrepTool({
	invocation,
}: {
	invocation: GrepUIToolInvocation;
}) {
	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool>
			<ToolHeader icon={SearchIcon}>
				<span className="truncate font-medium text-sm">
					Grep for {input?.pattern ? `"${input.pattern}"` : ""}
					{input?.path ? ` in ${input.path}` : ""}
				</span>
			</ToolHeader>
			<ToolContent>
				{typeof output === "string" ? (
					<CodeBlock code={output} language="json" className="text-sm" />
				) : null}
			</ToolContent>
		</Tool>
	);
}
