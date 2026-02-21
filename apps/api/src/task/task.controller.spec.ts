import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

const mockTaskService = {
  create: vi.fn(),
  findAll: vi.fn(),
};

describe("TaskController", () => {
  let controller: TaskController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TaskController(mockTaskService as unknown as TaskService);
  });

  describe("create", () => {
    it("should delegate to taskService.create when called with dto and user", async () => {
      const dto = {
        title: "My task",
        content: "Some content",
        priority: "HIGH" as const,
        completed: false,
      };
      const user = { sub: "user-1", email: "test@example.com" };
      const created = { id: "task-1", ...dto };
      mockTaskService.create.mockResolvedValue(created);

      const result = await controller.create(dto, user);

      expect(mockTaskService.create).toHaveBeenCalledWith(dto, "user-1");
      expect(result).toEqual(created);
    });
  });

  describe("findAll", () => {
    it("should delegate to taskService.findAll when called with query and user", async () => {
      const query = { page: 1, pageSize: 10 as const };
      const user = { sub: "user-1", email: "test@example.com" };
      const paginated = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
      mockTaskService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(query, user);

      expect(mockTaskService.findAll).toHaveBeenCalledWith(query, "user-1");
      expect(result).toEqual(paginated);
    });
  });
});
