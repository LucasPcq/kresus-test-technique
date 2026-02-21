import { env } from "@/config/env";
import { authHandlers } from "./auth";

export { mockAuthUser } from "./auth";

export const apiUrl = (path: string) => `${env.VITE_API_URL}${path}`;

export const handlers = [...authHandlers];
