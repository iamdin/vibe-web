import { CodeBlock } from "@vibe-web/ui/ai-elements/code-block";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import type {
	EditUIToolInvocation,
} from "ai-sdk-claude-code";
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