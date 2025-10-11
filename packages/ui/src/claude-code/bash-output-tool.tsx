import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { BashOutputUIToolInvocation } from "ai-sdk-agents/claude-code";
import { SquareTerminalIcon } from "lucide-react";

export function ClaudeCodeBashOutputTool({
	invocation,
}: {
	invocation: BashOutputUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={SquareTerminalIcon}>
				<span className="truncate font-medium text-sm">
					Bash Output {input?.bash_id ? `(${input.bash_id})` : ""}
				</span>
			</ToolHeader>
			<ToolContent>
				{output ? (
					<div className="relative">
						<CodeBlock
							code={output}
							language="bash"
							className="text-sm"
						/>
					</div>
				) : null}
			</ToolContent>
		</Tool>
	);
}
