import { orpc } from "../orpc";
import { claudeCode } from "./claude-code";

export const routes = {
	healthCheck: orpc.handler(() => ({ ok: true })),
	claudeCode,
};

export type Routes = typeof routes;
