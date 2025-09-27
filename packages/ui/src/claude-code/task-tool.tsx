import { Response } from "@vibe-web/ui/ai-elements/response";
import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import {
	isToolUIPart,
	type ToolUIPart,
	type UIDataTypes,
	type UIMessage,
} from "ai";
import type { ClaudeCodeTools, TaskUIToolInvocation } from "ai-sdk-claude-code";
import { ListChecksIcon } from "lucide-react";
import { type ReactNode, useMemo } from "react";

export function ClaudeCodeTaskTool({
	message,
	invocation,
	renderToolComponent,
}: {
	message: UIMessage<unknown, UIDataTypes, ClaudeCodeTools>;
	invocation: TaskUIToolInvocation;
	renderToolComponent?: (part: ToolUIPart<ClaudeCodeTools>) => ReactNode;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	const childrenToolUIParts = useMemo(
		() =>
			message.parts
				.filter((part) => {
					if (!isToolUIPart(part)) return false;
					return (
						part.type !== "tool-Task" &&
						part.state !== "input-streaming" &&
						part.callProviderMetadata?.claudeCode?.parentToolUseId ===
							invocation.toolCallId // this cause not type safe
					);
				})
				.filter((part) => isToolUIPart(part)),
		[message.parts, invocation.toolCallId],
	);

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input, output } = invocation;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={ListChecksIcon}>
				<span className="truncate font-medium text-sm">
					Task {input?.description}
				</span>
			</ToolHeader>
			<ToolContent className="space-y-2">
				<Response>{input?.prompt}</Response>
				{childrenToolUIParts.map((part) => {
					return renderToolComponent ? renderToolComponent(part) : null;
				})}
				{Array.isArray(output)
					? output.map((part) => {
							switch (part.type) {
								case "text":
									return (
										<div key={part.text}>
											<Response>{part.text}</Response>
										</div>
									);
								default:
									return null;
							}
						})
					: null}
			</ToolContent>
		</Tool>
	);
}
