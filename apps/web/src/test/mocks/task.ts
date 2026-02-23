import { PRIORITY } from "@kresus/contract";
import type { PaginatedResponse, TaskResponse } from "@kresus/contract";

export const mockTasks: TaskResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440101",
    title: "Rédiger le rapport",
    content: "Rédiger le rapport trimestriel pour le client",
    priority: PRIORITY.HIGH,
    executionDate: new Date("2026-04-15"),
    completedAt: null,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
    userId: "550e8400-e29b-41d4-a716-446655440001",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440102",
    title: "Envoyer les factures",
    content: "Envoyer les factures du mois de janvier",
    priority: PRIORITY.MEDIUM,
    executionDate: new Date("2026-03-01"),
    completedAt: new Date("2026-02-20"),
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-02-20"),
    userId: "550e8400-e29b-41d4-a716-446655440001",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440103",
    title: "Mettre à jour la documentation",
    content: "Mettre à jour la documentation technique du projet",
    priority: PRIORITY.LOW,
    executionDate: null,
    completedAt: null,
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-02-10"),
    userId: "550e8400-e29b-41d4-a716-446655440001",
  },
];

export const mockPaginatedTasks: PaginatedResponse<TaskResponse> = {
  items: mockTasks,
  total: 3,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

export const mockCreatedTask: TaskResponse = {
  id: "550e8400-e29b-41d4-a716-446655440104",
  title: "Nouvelle tâche",
  content: "Description de la nouvelle tâche",
  priority: PRIORITY.MEDIUM,
  executionDate: null,
  completedAt: null,
  createdAt: new Date("2026-02-21"),
  updatedAt: new Date("2026-02-21"),
  userId: "550e8400-e29b-41d4-a716-446655440001",
};
