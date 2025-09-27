import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type {
	GrepUIToolInvocation,
} from "ai-sdk-claude-code";
import { SearchIcon } from "lucide-react";

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