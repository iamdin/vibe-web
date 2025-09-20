import { type InferUITools, type ToolSet, tool } from "ai";
import { z } from "zod/v4";

/**
 * Generate by Claude Code, may be wrong, correct it in the future.
 */

const Bash = tool({
	type: "provider-defined",
	id: "claude-code.Bash",
	name: "Bash",
	args: {},
	inputSchema: z.object({
		command: z.string().describe("The command to execute"),
		description: z
			.string()
			.optional()
			.describe(
				"Clear, concise description of what this command does in 5-10 words",
			),
	}),
	outputSchema: z.string(),
});

const Task = tool({
	type: "provider-defined",
	id: "claude-code.Task",
	name: "Task",
	args: {},
	inputSchema: z.object({
		description: z
			.string()
			.describe("A short (3-5 word) description of the task"),
		prompt: z.string().describe("The task for the agent to perform"),
		subagent_type: z
			.string()
			.describe("The type of specialized agent to use for this task"),
	}),
	outputSchema: z.array(
		z.discriminatedUnion("type", [
			z.object({
				type: z.literal("text"),
				text: z.string(),
			}),
		]),
	),
});

const Glob = tool({
	type: "provider-defined",
	id: "claude-code.Glob",
	name: "Glob",
	args: {},
	inputSchema: z.object({
		pattern: z.string().describe("The glob pattern to match files against"),
		path: z
			.string()
			.optional()
			.describe(
				"The directory to search in. If not specified, the current working directory will be used",
			),
	}),
	outputSchema: z.object({
		files: z.array(z.string()),
		count: z.number(),
	}),
});

const Grep = tool({
	type: "provider-defined",
	id: "claude-code.Grep",
	name: "Grep",
	args: {},
	inputSchema: z.object({
		pattern: z
			.string()
			.describe(
				"The regular expression pattern to search for in file contents",
			),
		path: z
			.string()
			.optional()
			.describe(
				"File or directory to search in (defaults to current working directory)",
			),
		output_mode: z
			.enum(["content", "files_with_matches", "count"])
			.optional()
			.describe("Output mode"),
		glob: z.string().optional().describe("Glob pattern to filter files"),
		type: z.string().optional().describe("File type to search"),
		"-i": z.boolean().optional().describe("Case insensitive search"),
		"-n": z.boolean().optional().describe("Show line numbers in output"),
		"-A": z
			.number()
			.optional()
			.describe("Number of lines to show after each match"),
		"-B": z
			.number()
			.optional()
			.describe("Number of lines to show before each match"),
		"-C": z
			.number()
			.optional()
			.describe("Number of lines to show before and after each match"),
		multiline: z.boolean().optional().describe("Enable multiline mode"),
		head_limit: z
			.number()
			.optional()
			.describe("Limit output to first N lines/entries"),
	}),
	outputSchema: z.string(),
});

const Read = tool({
	type: "provider-defined",
	id: "claude-code.Read",
	name: "Read",
	args: {},
	inputSchema: z.object({
		file_path: z.string().describe("The absolute path to the file to read"),
		limit: z.number().optional().describe("The number of lines to read"),
		offset: z
			.number()
			.optional()
			.describe("The line number to start reading from"),
	}),
	outputSchema: z.string(),
});

const Edit = tool({
	type: "provider-defined",
	id: "claude-code.Edit",
	name: "Edit",
	args: {},
	inputSchema: z.object({
		file_path: z.string().describe("The absolute path to the file to modify"),
		old_string: z.string().describe("The text to replace"),
		new_string: z.string().describe("The text to replace it with"),
		replace_all: z
			.boolean()
			.optional()
			.default(false)
			.describe("Replace all occurrences"),
	}),
	outputSchema: z.string(),
});

const MultiEdit = tool({
	type: "provider-defined",
	id: "claude-code.MultiEdit",
	name: "MultiEdit",
	args: {},
	inputSchema: z.object({
		file_path: z.string().describe("The absolute path to the file to modify"),
		edits: z
			.array(
				z.object({
					old_string: z.string().describe("The text to replace"),
					new_string: z.string().describe("The text to replace it with"),
					replace_all: z
						.boolean()
						.optional()
						.default(false)
						.describe("Replace all occurrences"),
				}),
			)
			.min(1)
			.describe("Array of edit operations to perform sequentially"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		totalReplacements: z.number(),
		appliedEdits: z.number(),
		message: z.string(),
	}),
});

const Write = tool({
	type: "provider-defined",
	id: "claude-code.Write",
	name: "Write",
	args: {},
	inputSchema: z.object({
		file_path: z.string().describe("The absolute path to the file to write"),
		content: z.string().describe("The content to write to the file"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		path: z.string(),
		bytesWritten: z.number().optional(),
		message: z.string(),
	}),
});

const NotebookEdit = tool({
	type: "provider-defined",
	id: "claude-code.NotebookEdit",
	name: "NotebookEdit",
	args: {},
	inputSchema: z.object({
		notebook_path: z
			.string()
			.describe("The absolute path to the Jupyter notebook file"),
		new_source: z.string().describe("The new source for the cell"),
		cell_id: z.string().optional().describe("The ID of the cell to edit"),
		cell_type: z
			.enum(["code", "markdown"])
			.optional()
			.describe("The type of the cell"),
		edit_mode: z
			.enum(["replace", "insert", "delete"])
			.optional()
			.describe("The type of edit to make"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		cellId: z.string().optional(),
		message: z.string(),
	}),
});

const ExitPlanMode = tool({
	type: "provider-defined",
	id: "claude-code.ExitPlanMode",
	name: "ExitPlanMode",
	args: {},
	inputSchema: z.object({
		plan: z.string().describe("The plan in markdown format"),
	}),
	outputSchema: z.object({
		approved: z.boolean(),
		message: z.string(),
	}),
});

const WebFetch = tool({
	type: "provider-defined",
	id: "claude-code.WebFetch",
	name: "WebFetch",
	args: {},
	inputSchema: z.object({
		url: z.string().describe("The URL to fetch content from"),
		prompt: z.string().describe("The prompt to run on the fetched content"),
	}),
	outputSchema: z.object({
		content: z.string(),
		processedResult: z.string(),
		redirectUrl: z.string().optional(),
		fromCache: z.boolean().optional(),
	}),
});

const TodoWrite = tool({
	type: "provider-defined",
	id: "claude-code.TodoWrite",
	name: "TodoWrite",
	args: {},
	inputSchema: z.object({
		todos: z
			.array(
				z.object({
					content: z
						.string()
						.min(1)
						.describe("Task description in imperative form"),
					status: z
						.enum(["pending", "in_progress", "completed"])
						.describe("Task status"),
					activeForm: z
						.string()
						.min(1)
						.describe("Present continuous form of the task"),
				}),
			)
			.describe("The updated todo list"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		todoCount: z.number(),
		message: z.string(),
	}),
});

const WebSearch = tool({
	type: "provider-defined",
	id: "claude-code.WebSearch",
	name: "WebSearch",
	args: {},
	inputSchema: z.object({
		query: z.string().min(2).describe("The search query to use"),
		allowed_domains: z
			.array(z.string())
			.optional()
			.describe("Only include results from these domains"),
		blocked_domains: z
			.array(z.string())
			.optional()
			.describe("Never include results from these domains"),
	}),
	outputSchema: z.object({
		results: z.array(
			z.object({
				title: z.string(),
				url: z.string(),
				snippet: z.string(),
				relevance: z.number().optional(),
			}),
		),
		totalResults: z.number(),
	}),
});

const BashOutput = tool({
	type: "provider-defined",
	id: "claude-code.BashOutput",
	name: "BashOutput",
	args: {},
	inputSchema: z.object({
		bash_id: z.string().describe("The ID of the background shell"),
		filter: z
			.string()
			.optional()
			.describe("Optional regular expression to filter output"),
	}),
	outputSchema: z.object({
		stdout: z.string(),
		stderr: z.string(),
		status: z.enum(["running", "completed", "failed"]),
		exitCode: z.number().optional(),
		newOutput: z.boolean(),
	}),
});

const KillShell = tool({
	type: "provider-defined",
	id: "claude-code.KillShell",
	name: "KillShell",
	args: {},
	inputSchema: z.object({
		shell_id: z.string().describe("The ID of the background shell to kill"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		message: z.string(),
	}),
});

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
	KillShell,
} satisfies ToolSet;

export type ClaudeCodeTools = InferUITools<typeof claudeCodeTools>;
