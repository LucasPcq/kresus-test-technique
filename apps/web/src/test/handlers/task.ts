import { http, HttpResponse } from "msw";

import { PRIORITY } from "@kresus/contract";
import type { PaginatedResponse, TaskResponse } from "@kresus/contract";

import { env } from "@/config/env";

export const mockTasks: TaskResponse[] = [
  {
    id: "1",
    title: "Rédiger le rapport",
    content: "Rédiger le rapport trimestriel pour le client",
    priority: PRIORITY.HIGH,
    executionDate: new Date("2026-04-15"),
    completedAt: null,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
    userId: "1",
  },
  {
    id: "2",
    title: "Envoyer les factures",
    content: "Envoyer les factures du mois de janvier",
    priority: PRIORITY.MEDIUM,
    executionDate: new Date("2026-03-01"),
    completedAt: new Date("2026-02-20"),
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-02-20"),
    userId: "1",
  },
  {
    id: "3",
    title: "Mettre à jour la documentation",
    content: "Mettre à jour la documentation technique du projet",
    priority: PRIORITY.LOW,
    executionDate: null,
    completedAt: null,
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-02-10"),
    userId: "1",
  },
];

export const mockPaginatedTasks: PaginatedResponse<TaskResponse> = {
  items: mockTasks,
  total: 3,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

export const taskHandlers = [
  http.get(`${env.VITE_API_URL}/tasks`, () => HttpResponse.json(mockPaginatedTasks)),
];
