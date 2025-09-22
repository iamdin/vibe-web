import type { InferUITools, ToolSet } from "ai";

import { Bash } from "./tools/bash";
import { BashOutput } from "./tools/bash-output";
import { Edit } from "./tools/edit";
import { ExitPlanMode } from "./tools/exit-plan-mode";
import { Glob } from "./tools/glob";
import { Grep } from "./tools/grep";
import { KillShell } from "./tools/kill-shell";
import { MultiEdit } from "./tools/multi-edit";
import { NotebookEdit } from "./tools/notebook-edit";
import { Read } from "./tools/read";
import { Task } from "./tools/task";
import { TodoWrite } from "./tools/todo-write";
import { WebFetch } from "./tools/web-fetch";
import { WebSearch } from "./tools/web-search";
import { Write } from "./tools/write";

export const claudeCodeTools = {
	Bash,
	Task,
	Glob,
	Grep,
	Read,
	Edit,
	MultiEdit,
	Write,
	NotebookEdit,
	ExitPlanMode,
	WebFetch,
	TodoWrite,
	WebSearch,
	BashOutput,
	/** anthropic doc called KillBash, but it is KillShell */
	KillShell,
	// ListMcpResources,
	// ReadMcpResource,
} satisfies ToolSet;

export type ClaudeCodeTools = InferUITools<typeof claudeCodeTools>;

export { toUIMessage } from "./utils/to-ui-message";
