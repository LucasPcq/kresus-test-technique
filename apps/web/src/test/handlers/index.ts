import { env } from "@/config/env";
import { authHandlers } from "./auth";
import { taskHandlers } from "./task";

export { mockAuthUser } from "../mocks/auth";
export { mockTasks, mockPaginatedTasks, mockCreatedTask } from "../mocks/task";

export const apiUrl = (path: string) => `${env.VITE_API_URL}${path}`;

export const handlers = [...authHandlers, ...taskHandlers];
