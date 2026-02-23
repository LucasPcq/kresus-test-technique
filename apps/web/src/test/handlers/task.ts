import { http, HttpResponse } from "msw";

import { env } from "@/config/env";

import { mockCreatedTask, mockPaginatedTasks, mockTasks } from "../mocks/task";

export const taskHandlers = [
  http.get(`${env.VITE_API_URL}/tasks`, () => HttpResponse.json(mockPaginatedTasks)),
  http.post(`${env.VITE_API_URL}/tasks`, () => HttpResponse.json(mockCreatedTask, { status: 201 })),
  http.patch(`${env.VITE_API_URL}/tasks/:id`, () => HttpResponse.json(mockTasks[0])),
  http.delete(`${env.VITE_API_URL}/tasks/:id`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${env.VITE_API_URL}/tasks/batch-delete`, () => HttpResponse.json({ count: 2 })),
];
