import { implement } from "@orpc/server";
import { claudeCodeContract } from "../contract/claude-code";

export const promptImplement = implement(claudeCodeContract.prompt).handler(
	async function* () {
		// Start message
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "start",
		};

		// Text start
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "text-start",
			id: "msg_01U7L4pQ4tPcaQXQwgRDEQxD",
		};

		// Text delta with the research content
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "text-delta",
			id: "msg_01U7L4pQ4tPcaQXQwgRDEQxD",
			delta:
				"I'll research how TanStack React Query handles refresh detection and whether you can access this information in the `queryFn`. Let me investigate this for you.",
		};

		// Text end
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "text-end",
			id: "msg_01U7L4pQ4tPcaQXQwgRDEQxD",
		};

		// Tool input available - Task
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "tool-input-available",
			toolCallId: "toolu_01UUntsxGqHYvSvpwB9veawC",
			toolName: "Task",
			input: {
				subagent_type: "general-purpose",
				description: "Research React Query refresh detection",
				prompt:
					"Research how TanStack React Query handles refresh detection and whether the queryFn can determine if a query execution was triggered by a refresh. I need to understand:\n\n1. How React Query differentiates between different types of query triggers (initial load, refetch, refresh, etc.)\n2. Whether the queryFn receives any context or parameters that indicate the trigger type\n3. What mechanisms are available to detect if a query was triggered by a refresh operation\n4. Any relevant documentation or examples showing how to access this information\n\nPlease search through React Query documentation, GitHub issues, and code examples to find comprehensive information about refresh detection in queryFn.",
			},
			providerExecuted: true,
		};

		// Tool input available - WebSearch
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "tool-input-available",
			toolCallId: "toolu_01KzUTe6HfVGtAaYBLUJMYRK",
			toolName: "WebSearch",
			input: {
				query:
					"TanStack React Query queryFn refresh detection trigger type parameters 2024 2025",
			},
			providerExecuted: true,
			providerMetadata: {
				claudeCode: {
					parentToolUseId: "toolu_01UUntsxGqHYvSvpwB9veawC",
				},
			},
		};

		// Simulate ping events and processing delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// First tool output - WebSearch
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "tool-output-available",
			toolCallId: "toolu_01KzUTe6HfVGtAaYBLUJMYRK",
			output:
				'Web search results for query: "TanStack React Query queryFn refresh detection trigger type parameters 2024 2025"\n\nLinks: [{"title":"useQuery | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/react/reference/useQuery"},{"title":"Queries | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/guides/queries"},{"title":"React TanStack Query Auto Refetching Example | TanStack Query Docs","url":"https://tanstack.com/query/v5/docs/framework/react/examples/auto-refetching"},{"title":"Window Focus Refetching | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/guides/window-focus-refetching"},{"title":"Query Functions | TanStack Query React Docs","url":"https://tanstack.com/query/latest/docs/framework/react/guides/query-functions"},{"title":"Overview | TanStack Query React Docs","url":"https://tanstack.com/query/latest/docs/framework/react/overview"},{"title":"Disabling/Pausing Queries | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/guides/disabling-queries"},{"title":"Query Options | TanStack Query React Docs","url":"https://tanstack.com/query/latest/docs/framework/react/guides/query-options"},{"title":"Query Retries | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/guides/query-retries"},{"title":"react query - Why does the browser trigger a refetch of values in useQuery from TanStack when it is refocused? - Stack Overflow","url":"https://stackoverflow.com/questions/75920230/why-does-the-browser-trigger-a-refetch-of-values-in-usequery-from-tanstack-when"}]\n\nBased on the search results, I found comprehensive information about TanStack React Query\'s queryFn, refresh detection, trigger types, and parameters. Here\'s what I found:\n\n## Query Function (queryFn) Parameters and Context\n\nTanStack React Query\'s queryFn is required and must be a function that returns a Promise resolving data or throwing an error. The QueryFunctionContext is the object passed to each query function and includes:\n\n- **queryKey**: Query keys are passed into your query function as part of the QueryFunctionContext, making it possible to extract your query functions if needed\n- **signal**: For handling cancellation\n- **meta**: Additional information stored on the query cache entry that can be used as needed and is accessible wherever the query is available\n\n## Refresh Detection and Trigger Types\n\nTanStack React Query has several built-in refresh triggers:\n\n### 1. Window Focus Refetching\nIf a user leaves your application and returns and the query data is stale, TanStack Query automatically requests fresh data for you in the background. This can be controlled with:\n- refetchOnWindowFocus: false to disable per-query\n- Global configuration through QueryClient defaultOptions\n\n### 2. Manual Refetch\nA function to manually refetch the query with options like throwOnError and cancelRefetch\n\n### 3. Automatic Interval Refetching\nrefetchInterval parameter for automatic refetching at specified intervals\n\n### 4. Staleness-Based Refetching\nSetting staleTime ensures you\'ll only see a refetch if the query isn\'t fresh anymore\n\n## Key Parameters for 2024-2025\n\nThe latest TanStack Query versions include these important parameters:\n\n- **enabled**: Use enabled = false option to disable a query from automatically running\n- **retry**: Control how many times failed requests retry before displaying an error\n- **retryDelay**: Function or number to control delay between retry attempts\n- **staleTime**: Controls when data is considered stale and needs refetching\n- **queryOptions helper**: Helper to share queryKey and queryFn between multiple places with TypeScript type inference and safety\n\nThe search results show that TanStack Query provides comprehensive control over when and how queries are triggered, with multiple refresh detection mechanisms and configurable parameters for modern React applications in 2024-2025.',
			providerExecuted: true,
			providerMetadata: {
				claudeCode: {
					parentToolUseId: "toolu_01UUntsxGqHYvSvpwB9veawC",
				},
			},
		};

		// Second WebSearch tool
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "tool-input-available",
			toolCallId: "toolu_01TBkZexu92quKwJNohSC3RR",
			toolName: "WebSearch",
			input: {
				query:
					'"QueryFunctionContext" TanStack React Query queryFn parameters signal meta queryKey 2024',
			},
			providerExecuted: true,
			providerMetadata: {
				claudeCode: {
					parentToolUseId: "toolu_01UUntsxGqHYvSvpwB9veawC",
				},
			},
		};

		await new Promise((resolve) => setTimeout(resolve, 500));

		yield {
			type: "tool-output-available",
			toolCallId: "toolu_01TBkZexu92quKwJNohSC3RR",
			output:
				'Web search results for query: ""QueryFunctionContext" TanStack React Query queryFn parameters signal meta queryKey 2024"\n\nI\'ll perform a web search for information about QueryFunctionContext in TanStack React Query with those specific parameters.\n\nLinks: [{"title":"Query Functions | TanStack Query React Docs","url":"https://tanstack.com/query/latest/docs/framework/react/guides/query-functions"},{"title":"useQuery | TanStack Query React Docs","url":"https://tanstack.com/query/latest/docs/framework/react/reference/useQuery"},{"title":"Error on queryFn · TanStack/query · Discussion #7588","url":"https://github.com/TanStack/query/discussions/7588"},{"title":"useQuery meta data · TanStack/query · Discussion #2772","url":"https://github.com/TanStack/query/discussions/2772"},{"title":"useInfiniteQuery | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/reference/useInfiniteQuery"},{"title":"Leveraging the Query Function Context | TkDodo\'s blog","url":"https://tkdodo.eu/blog/leveraging-the-query-function-context"},{"title":"What is the react query \\"queryKey\\" typescript type","url":"https://stackoverflow.com/questions/73343133/what-is-the-react-query-querykey-typescript-type"},{"title":"React Query and TypeScript | TkDodo\'s blog","url":"https://tkdodo.eu/blog/react-query-and-type-script"},{"title":"Pass `queryClient` as first argument of `initialDataFn` · TanStack/query · Discussion #2764","url":"https://github.com/TanStack/query/discussions/2764"},{"title":"[React] TanStack Query v5 (React Query) API 레퍼런스 | Beomy","url":"https://beomy.github.io/tech/react/tanstack-query-v5-api-reference/"}]\n\nBased on the search results, I can provide you with comprehensive information about `QueryFunctionContext` in TanStack React Query and its parameters including `signal`, `meta`, and `queryKey`.\n\n## QueryFunctionContext Overview\n\nThe QueryFunctionContext is an object that is passed as argument to the queryFn.(no content)Query keys are not just for uniquely identifying the data you are fetching, but are also conveniently passed into your query function as part of the QueryFunctionContext.\n\n## QueryFunctionContext Parameters\n\nThe `QueryFunctionContext` contains several key properties:\n\n### 1. queryKey\nWhile not always necessary, this makes it possible to extract your query functions if needed: function Todos({ status, page }) { const result = useQuery({ queryKey: [\'todos\', { status, page }], queryFn: fetchTodoList, }) } // Access the key, status and page variables in your query function! function fetchTodoList({ queryKey }) { const [_key, { status, page }] = queryKey return new Promise() }\n\n### 2. signal (AbortSignal)\nType \'{ queryKey: string[]; signal: AbortSignal; meta: Record<string, unknown> | undefined; pageParam?: unknown; direction?: unknown; }\' is not assignable to type \'string\'. This shows that `signal` is an `AbortSignal` included in the context for request cancellation.\n\n### 3. meta\nIt will be accessible wherever the query is available, and is also part of the QueryFunctionContext provided to the queryFn.(no content)It would likely be available wherever the query is available, and it should likely also be attached to the QueryContext so that it\'s passed to the queryFn.\n\n## TypeScript Support\n\nOne of the ambitions for this approach was to get full type safety and infer the type of the QueryFunctionContext from the queryKey passed to useQuery. This wasn\'t easy, but React Query supports that since v3.13.3. If you inline the queryFn, you\'ll see that the types are properly inferred (thank you, Generics):\n\n### Typing the Context\nThe type QueryFunctionContext is exported by React Query. It takes one generic, which defines the type of the queryKey.\n\nExample usage:\nimport { QueryFunctionContext } from \'@tanstack/react-query\'; export const validateToken = async ({ queryKey }: QueryFunctionContext<[string, string | null | undefined]>) => {\n\n## Query Function Definition\n\nqueryFn: (context: QueryFunctionContext) => Promise<TData> Required, but on(no content)type QueryFunction<T = unknown, TQueryKey extends QueryKey = QueryKey, TPageParam = never> = (context: QueryFunctionContext<TQueryKey, TPageParam>) => T | Promise<T>;\n\n## Usage Pattern\n\nWith this approach, you basically have no way of using any additional parameters in your queryFn without also adding them to the queryKey. This ensures consistency between dependencies and the query key.\n\nThe QueryFunctionContext provides a structured way to access query metadata, cancellation signals, and the query key itself within your query functions, promoting better type safety and consistency in TanStack React Query applications.',
			providerExecuted: true,
			providerMetadata: {
				claudeCode: {
					parentToolUseId: "toolu_01UUntsxGqHYvSvpwB9veawC",
				},
			},
		};

		// Continue with more tool calls from the log...
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "tool-input-available",
			toolCallId: "toolu_01YZKCn9jWokx4vDoMSuKYLC",
			toolName: "WebSearch",
			input: {
				query:
					'TanStack React Query refetch trigger type "refetchOnWindowFocus" "refetchOnMount" "refetchOnReconnect" context',
			},
			providerExecuted: true,
			providerMetadata: {
				claudeCode: {
					parentToolUseId: "toolu_01UUntsxGqHYvSvpwB9veawC",
				},
			},
		};

		await new Promise((resolve) => setTimeout(resolve, 500));

		yield {
			type: "tool-output-available",
			toolCallId: "toolu_01YZKCn9jWokx4vDoMSuKYLC",
			output:
				'Web search results for query: "TanStack React Query refetch trigger type "refetchOnWindowFocus" "refetchOnMount" "refetchOnReconnect" context"\n\nLinks: [{"title":"useQuery | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/reference/useQuery"},{"title":"A beginner\'s guide to react query (Tanstack V5), part 2: The query client. | by Emmanuel Nnajiofor | Medium","url":"https://medium.com/@emiklad/a-beginners-guide-to-react-query-tanstack-v5-part-2-the-query-client-d385d5e092f6"},{"title":"Important Defaults | TanStack Query React Docs","url":"https://tanstack.com/query/v4/docs/framework/react/guides/important-defaults"},{"title":"QueryClient | TanStack Query Docs","url":"https://tanstack.com/query/latest/docs/reference/QueryClient"},{"title":"Force refetch with React Query - Codemzy\'s Blog","url":"https://www.codemzy.com/blog/react-query-force-refetch"},{"title":"Always refetching when router with react-router changes · TanStack/query · Discussion #3731","url":"https://github.com/TanStack/query/discussions/3731"},{"title":"Prevent query re-fetching on component remount · TanStack/query · Discussion #616","url":"https://github.com/TanStack/query/discussions/616"},{"title":"Common Patterns and Nuances Using React Query - This Dot Labs","url":"https://www.thisdot.co/blog/common-patterns-and-nuances-using-react-query"},{"title":"A beginner\'s guide to react query (Tanstack V5), part 3: The useQuery hook. | by Emmanuel Nnajiofor | Medium","url":"https://medium.com/@emiklad/a-beginners-guide-to-react-query-tanstack-v5-part-3-the-usequery-hook-af6af5abea07"},{"title":"Fetch a query only once until page refresh using React Query | by David Han | In the weeds | Medium","url":"https://medium.com/in-the-weeds/fetch-a-query-only-once-until-page-refresh-using-react-query-a333d00b86ff"}]\n\nBased on the search results, I can provide comprehensive information about TanStack React Query\'s refetch trigger types and context for `refetchOnWindowFocus`, `refetchOnMount`, and `refetchOnReconnect`:\n\n## TanStack React Query Refetch Trigger Types\n\n### 1. `refetchOnWindowFocus`\nThis option can be set to `boolean | "always" | ((query: Query) => boolean | "always")`. If set to true, the query will refetch on window focus if the data is stale. If set to false, the query will not refetch on window focus. If set to "always", the query will always refetch on window focus.(no content)This specifies whether a query should be refetched when the window or tab gains focus. Setting it to true ensures that the query is refetched whenever the focus returns to the window or tab. Setting it as false, disables automatic refetching on window focus, meaning data won\'t be refreshed when users return to the app window.\n\n### 2. `refetchOnReconnect`\nThis option can be set to `boolean | "always" | ((query: Query) => boolean | "always")`. If set to true, the query will refetch on reconnect if the data is stale. If set to false, the query will not refetch on reconnect. If set to "always", the query will always refetch on reconnect.(no content)This handles scenarios where a user\'s internet connection drops, then reconnects. It triggers a data refresh whenever the app reconnects to the internet after a connection loss. Setting this option as true ensures that whenever users regain connectivity, they\'re presented with the most recent data available.\n\n### 3. `refetchOnMount`\nThis is one of the available options in useQuery configuration alongside refetchOnReconnect and refetchOnWindowFocus. While not explicitly detailed in these results, `refetchOnMount` controls whether queries refetch when a component mounts.\n\n## Context and Default Behavior\n\nOut of the box, TanStack Query is configured with aggressive but sane defaults. If you see a refetch that you are not expecting, it is likely because you just focused the window and TanStack Query is doing a refetchOnWindowFocus. During development, this will probably be triggered more frequently, especially because focusing between the Browser DevTools and your app will also cause a fetch. To change this functionality, you can use options like refetchOnMount, refetchOnWindowFocus, refetchOnReconnect and refetchInterval.\n\n## Configuration Options\n\nThese refetch triggers can be configured at different levels:\n\n1. **Global defaults** via QueryClient:\nExample configuration showing defaultOptions for queries including refetchOnMount: true, refetchOnWindowFocus: true, refetchOnReconnect: true\n\n2. **Per-query basis** in useQuery hooks:\nAll parameters like refetchIntervalInBackground, refetchOnMount, refetchOnReconnect, refetchOnWindowFocus that are usually configured on the queryClient can also be configured for individual queries, allowing fine-tuning of unique query behavior.\n\n## Important Notes\n\nThese options (refetchOnWindowFocus, refetchOnReconnect, refetchOnMount) are strictly for useQuery and useInfiniteQuery, and are not available for fetchQuery method.(no content)These are default actions available on useQuery that can trigger refetches, similar to how you might force a refetch with manual actions.\n\nThese refetch triggers are part of TanStack Query\'s automatic data synchronization strategy, helping ensure your application data stays fresh based on user interactions and connection states.',
			providerExecuted: true,
			providerMetadata: {
				claudeCode: {
					parentToolUseId: "toolu_01UUntsxGqHYvSvpwB9veawC",
				},
			},
		};

		// Continue with all the remaining tool calls from the log...
		// [Continuing pattern for all remaining tool calls]

		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Final comprehensive tool output from Task agent
		yield {
			type: "tool-output-available",
			toolCallId: "toolu_01UUntsxGqHYvSvpwB9veawC",
			output: [
				{
					type: "text",
					text: "Based on my comprehensive research of TanStack React Query documentation, GitHub issues, community discussions, and expert blog posts, here's what I found about refresh detection and trigger differentiation in the queryFn:\n\n## Key Findings\n\n### 1. **QueryFn Context and Parameters**\n\nThe `queryFn` receives a `QueryFunctionContext` object with these properties:\n- **queryKey**: The unique identifier for the query\n- **signal**: AbortSignal for request cancellation\n- **meta**: Optional metadata that can be passed to queries\n- **pageParam**: For infinite queries\n\n**Important limitation**: The `QueryFunctionContext` does **not** include information about what triggered the query execution (manual refetch, window focus, mount, etc.).\n\n### 2. **Query State Differentiation**\n\nTanStack React Query provides several boolean flags to differentiate between query states:\n\n**React Query v5 flags:**\n- `isPending`: Initial fetch with no cached data\n- `isLoading`: Same as `isFetching && isPending` \n- `isFetching`: Any request in-flight (initial or background)\n- `isRefetching`: Background refetch only (`isFetching && !isPending`)\n\n**Trigger types supported:**\n- `refetchOnMount`: When component mounts\n- `refetchOnWindowFocus`: When browser window gains focus  \n- `refetchOnReconnect`: When network reconnects\n- Manual `refetch()` calls\n- Query invalidation\n\n### 3. **Limitations in Trigger Detection**\n\nFrom GitHub discussions and issues, I found several key limitations:\n\n- **No built-in trigger source detection**: The `queryFn` cannot directly determine if it was called due to window focus, manual refetch, invalidation, or other triggers\n- **Community workarounds**: Developers use patterns like refs, state variables, or the `meta` property to track trigger sources\n- **Timing issues**: Different triggers can have different timing behaviors (e.g., automatic refetches may use stale queryFn references)\n\n### 4. **Workaround Solutions**\n\n**Using the `meta` property:**\n```typescript\n// Set trigger context via meta\nconst query = useQuery({\n  queryKey: ['data'],\n  queryFn: ({ meta }) => {\n    // meta can contain custom trigger information\n    console.log('Trigger source:', meta?.triggerSource);\n    return fetchData();\n  },\n  meta: { triggerSource: 'manual' }\n});\n```\n\n**Using external state tracking:**\n```typescript\nconst triggerRef = useRef('initial');\n\nconst query = useQuery({\n  queryKey: ['data'],\n  queryFn: () => {\n    console.log('Triggered by:', triggerRef.current);\n    return fetchData();\n  }\n});\n\n// Manually track trigger source\nconst handleManualRefetch = () => {\n  triggerRef.current = 'manual';\n  query.refetch();\n};\n```\n\n### 5. **Query State Flags as Trigger Indicators**\n\nWhile not perfect, you can use the query state flags to infer trigger context:\n- `isRefetching && !isPending`: Background refetch (window focus, reconnect, interval)\n- `isPending`: Initial load or mount\n- Manual tracking of `refetch()` calls\n\n## Conclusion\n\n**TanStack React Query does not provide a built-in way for queryFn to detect what triggered its execution.** The library focuses on providing state flags (`isPending`, `isFetching`, `isRefetching`) that help differentiate between initial loading and background updates, but the specific trigger source (window focus vs manual refetch vs invalidation) is not exposed to the query function.\n\nThe recommended approach is to use external state management or the `meta` property to track trigger sources when this information is needed for query execution logic.",
				},
			],
			providerExecuted: true,
		};

		// Final text start
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "text-start",
			id: "msg_01KNTfr9JyjQKi3mb3Eg8eHX",
		};

		// Final text delta
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "text-delta",
			id: "msg_01KNTfr9JyjQKi3mb3Eg8eHX",
			delta:
				"Based on my research, here's what I found about TanStack React Query refresh detection:\n\n## 核心结论\n\n**TanStack React Query 的 `queryFn` 无法直接判断是否为 refresh 触发**。`queryFn` 接收的 `QueryFunctionContext` 不包含触发源信息。\n\n## 可用的状态标识\n\nReact Query 提供这些状态标识来区分不同的查询状态：\n\n- `isPending`: 初始加载（无缓存数据）\n- `isFetching`: 任何请求进行中\n- `isRefetching`: 后台重新获取 (`isFetching && !isPending`)\n\n## 解决方案\n\n### 1. 使用 meta 属性传递触发源信息\n\n```typescript\nconst query = useQuery({\n  queryKey: ['data'],\n  queryFn: ({ meta }) => {\n    if (meta?.isRefresh) {\n      console.log('This is a refresh');\n    }\n    return fetchData();\n  },\n  meta: { isRefresh: false }\n});\n\n// 手动刷新时设置 meta\nconst handleRefresh = () => {\n  queryClient.setQueryData(['data'], undefined, { \n    meta: { isRefresh: true } \n  });\n  query.refetch();\n};\n```\n\n### 2. 使用外部状态跟踪\n\n```typescript\nconst triggerTypeRef = useRef<'initial' | 'refresh' | 'background'>('initial');\n\nconst query = useQuery({\n  queryKey: ['data'],\n  queryFn: () => {\n    const triggerType = triggerTypeRef.current;\n    console.log('Trigger type:', triggerType);\n    return fetchData();\n  }\n});\n```\n\n### 3. 通过状态标识推断\n\n虽然不完美，但可以通过 `isRefetching` 来判断是否为后台刷新：\n\n```typescript\nconst query = useQuery({...});\n\n// 在组件中判断\nif (query.isRefetching) {\n  // 这是后台刷新（可能是 window focus、重连等）\n}\n```\n\n总结：React Query 设计上不直接提供触发源信息给 `queryFn`，需要通过额外的状态管理来实现这个需求。",
		};

		// Final text end
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "text-end",
			id: "msg_01KNTfr9JyjQKi3mb3Eg8eHX",
		};

		// Finish
		await new Promise((resolve) => setTimeout(resolve, 500));
		yield {
			type: "finish",
		};
	},
);
