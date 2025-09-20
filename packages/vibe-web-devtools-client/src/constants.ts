/**
 * the root path of the project
 */
export const rootPath = /* @__PURE__ */ process.env.VIWEB_ROOT_PATH;
/**
 * the workspace path of the project (the git repository root path), useful in monorepo
 */
export const workspacePath = /* @__PURE__ */ process.env.VIWEB_WORKSPACE_PATH;
/**
 * the server port of the dev server
 */
// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const VIWEB_LOCAL_URL = /* @__PURE__ */ process.env.VIWEB_LOCAL_URL!;
