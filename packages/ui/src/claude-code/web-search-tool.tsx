import { Response } from "@vibe-web/ui/ai-elements/response";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { WebSearchUIToolInvocation } from "ai-sdk-claude-code";
import { SearchIcon } from "lucide-react";

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
