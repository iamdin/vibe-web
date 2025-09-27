import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { BashUIToolInvocation } from "ai-sdk-claude-code";
import { TerminalIcon } from "lucide-react";

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
