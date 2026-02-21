import { env } from "@/config/env";
import { authHandlers } from "./auth";
import { taskHandlers } from "./task";

export { mockAuthUser } from "./auth";
export { mockTasks, mockPaginatedTasks } from "./task";

export const apiUrl = (path: string) => `${env.VITE_API_URL}${path}`;

export const handlers = [...authHandlers, ...taskHandlers];
