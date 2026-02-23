import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { delay, http, HttpResponse } from "msw";

import type { PaginatedResponse, TaskResponse } from "@kresus/contract";

import { server } from "@/test/server";
import { buildWrapper } from "@/test/mount";
import { apiUrl, mockPaginatedTasks } from "@/test/handlers";

import TaskListView from "../views/TaskListView.vue";

describe("TaskListView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should show skeleton cards when data is loading", async () => {
    server.use(
      http.get(apiUrl("/tasks"), async () => {
        await delay("infinite");
        return HttpResponse.json(mockPaginatedTasks);
      }),
    );

    const { wrapper } = buildWrapper(TaskListView);
    await flushPromises();

    expect(wrapper.findAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("should render task cards when data is loaded", async () => {
    const { wrapper } = buildWrapper(TaskListView);

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Rédiger le rapport");
      expect(wrapper.text()).toContain("Envoyer les factures");
      expect(wrapper.text()).toContain("Mettre à jour la documentation");
    });
  });

  it("should show empty state when there are no tasks", async () => {
    const emptyResponse: PaginatedResponse<TaskResponse> = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };

    server.use(http.get(apiUrl("/tasks"), () => HttpResponse.json(emptyResponse)));

    const { wrapper } = buildWrapper(TaskListView);

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Aucune tâche");
    });
  });

  it("should render the page title when data is loaded", async () => {
    const { wrapper } = buildWrapper(TaskListView);

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Mes tâches");
    });
  });

  it("should render the sort select when data is loaded", async () => {
    const { wrapper } = buildWrapper(TaskListView);

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Trier par");
    });
  });

  it("should show error state when API returns 400", async () => {
    server.use(
      http.get(apiUrl("/tasks"), () => HttpResponse.json({ message: "Bad Request" }, { status: 400 })),
    );

    const { wrapper } = buildWrapper(TaskListView);

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Erreur de chargement");
      expect(wrapper.text()).not.toContain("Aucune tâche");
    });
  });

  it("should show pagination when data has multiple pages", async () => {
    const multiPageResponse: PaginatedResponse<TaskResponse> = {
      ...mockPaginatedTasks,
      total: 30,
      totalPages: 3,
    };

    server.use(http.get(apiUrl("/tasks"), () => HttpResponse.json(multiPageResponse)));

    const { wrapper } = buildWrapper(TaskListView);

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("30 tâches");
    });
  });
});
