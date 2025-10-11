import { Tool, ToolContent, ToolHeader } from "@vibe-web/ui/ai-elements/tool";
import { cn } from "@vibe-web/ui/lib/utils";
import type { TodoWriteUIToolInvocation } from "ai-sdk-agents/claude-code";
import {
	CircleCheckBigIcon,
	CircleCheckIcon,
	ListChecksIcon,
	ListTodoIcon,
	LoaderIcon,
} from "lucide-react";

export function ClaudeCodeTodoWriteTool({
	invocation,
}: {
	invocation: TodoWriteUIToolInvocation;
}) {
	const hasParentToolUseId =
		invocation.state !== "input-streaming" &&
		invocation.callProviderMetadata?.claudeCode?.parentToolUseId;

	if (!invocation || invocation.state === "input-streaming") return null;
	const { input } = invocation;

	const allComplete =
		input?.todos?.every((todo) => todo.status === "completed") ?? false;

	return (
		<Tool state={hasParentToolUseId ? undefined : invocation.state}>
			<ToolHeader icon={allComplete ? ListChecksIcon : ListTodoIcon}>
				<span className="truncate font-medium text-sm">
					Todo ({input?.todos?.length || 0} tasks)
				</span>
			</ToolHeader>
			<ToolContent>
				{input?.todos && input.todos.length > 0 ? (
					<div className="space-y-2">
						{input.todos.map((todo, todoIndex) => (
							<div
								key={`${todo.content}-${todoIndex}`}
								className="flex items-start gap-3"
							>
								{todo.status === "completed" && (
									<CircleCheckBigIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
								)}
								{todo.status === "in_progress" && (
									<CircleCheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
								)}
								{todo.status === "pending" && (
									<LoaderIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
								)}
								<div className="flex-1 min-w-0">
									<p
										className={cn(
											"text-sm font-medium",
											todo.status === "completed" &&
												"line-through text-muted-foreground",
										)}
									>
										{todo.status === "in_progress"
											? todo.activeForm
											: todo.content}
									</p>
								</div>
							</div>
						))}
					</div>
				) : null}
			</ToolContent>
		</Tool>
	);
}
