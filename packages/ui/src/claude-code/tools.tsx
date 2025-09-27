import type { ToolUIPart, UIDataTypes, UIMessage } from "ai";
import type { ClaudeCodeTools } from "ai-sdk-claude-code";
import { ClaudeCodeBashTool } from "./bash-tool";
import { ClaudeCodeEditTool } from "./edit-tool";
import { ClaudeCodeGrepTool } from "./grep-tool";
import { ClaudeCodeReadTool } from "./read-tool";
import { ClaudeCodeTaskTool } from "./task-tool";
import { ClaudeCodeWebFetchTool } from "./web-fetch-tool";
import { ClaudeCodeWebSearchTool } from "./web-search-tool";

function ClaudeCodeToolUIPart({
	message,
	part,
}: {
	message: UIMessage<unknown, UIDataTypes, ClaudeCodeTools>;
	part: ToolUIPart<ClaudeCodeTools>;
}) {
	if (
		!part ||
		part.state === "input-streaming" ||
		part.callProviderMetadata?.claudeCode?.parentToolUseId
	) {
		return null;
	}

	return (
		<ClaudeCodeToolUIPartComponent
			key={part.toolCallId}
			message={message}
			part={part}
		/>
	);
}

function ClaudeCodeToolUIPartComponent({
	message,
	part,
}: {
	message: UIMessage<unknown, UIDataTypes, ClaudeCodeTools>;
	part: ToolUIPart<ClaudeCodeTools>;
}) {
	// task tool renders nested tools
	if (part.type === "tool-Task") {
		return (
			<ClaudeCodeTaskTool
				message={message}
				invocation={part}
				renderToolComponent={(childPart) => (
					<ClaudeCodeToolUIPartComponent
						key={childPart.toolCallId}
						message={message}
						part={childPart}
					/>
				)}
			/>
		);
	}

	switch (part.type) {
		case "tool-Bash":
			return <ClaudeCodeBashTool invocation={part} />;
		case "tool-Read":
			return <ClaudeCodeReadTool invocation={part} />;
		case "tool-Grep":
			return <ClaudeCodeGrepTool invocation={part} />;
		case "tool-Edit":
			return <ClaudeCodeEditTool invocation={part} />;
		case "tool-WebFetch":
			return <ClaudeCodeWebFetchTool invocation={part} />;
		case "tool-WebSearch":
			return <ClaudeCodeWebSearchTool invocation={part} />;
		default:
			return null;
	}
}

export {
	ClaudeCodeBashTool,
	ClaudeCodeEditTool,
	ClaudeCodeGrepTool,
	ClaudeCodeReadTool,
	ClaudeCodeTaskTool,
	ClaudeCodeToolUIPart,
	ClaudeCodeWebFetchTool,
	ClaudeCodeWebSearchTool,
};
