import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type { EditUIToolInvocation } from "ai-sdk-agents/claude-code";
import { EditIcon } from "lucide-react";

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

	const language = input?.file_path?.match(/\.(\w+)$/)?.[1] || "text";

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={EditIcon}>
				<span className="truncate font-medium text-sm">
					Edit {input?.file_path}
				</span>
			</ToolHeader>
			<ToolContent className="space-y-2">
				{input?.old_string ? (
					<>
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Old String
						</h4>
						<CodeBlock
							code={input.old_string}
							language={language}
							className="text-xs"
						/>
					</>
				) : null}
				{input?.new_string ? (
					<>
						<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							New String
						</h4>
						<CodeBlock
							code={input.new_string}
							language={language}
							className="text-xs"
						/>
					</>
				) : null}
			</ToolContent>
		</Tool>
	);
}
