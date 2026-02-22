import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

const mockTaskService = {
  create: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  batchDelete: vi.fn(),
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

    it("should pass filters to taskService.findAll when filters provided", async () => {
      const query = {
        page: 1,
        pageSize: 10 as const,
        sort: "-priority",
        filter: { completed: true, priority: { eq: "HIGH" as const } },
      };
      const user = { sub: "user-1", email: "test@example.com" };
      mockTaskService.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await controller.findAll(query, user);

      expect(mockTaskService.findAll).toHaveBeenCalledWith(query, "user-1");
    });
  });

  describe("update", () => {
    it("should delegate to taskService.update when called with id, dto and user", async () => {
      const dto = { title: "Updated task" };
      const user = { sub: "user-1", email: "test@example.com" };
      const updated = { id: "task-1", ...dto };
      mockTaskService.update.mockResolvedValue(updated);

      const result = await controller.update("task-1", dto, user);

      expect(mockTaskService.update).toHaveBeenCalledWith("task-1", dto, "user-1");
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("should delegate to taskService.delete when called with id and user", async () => {
      const user = { sub: "user-1", email: "test@example.com" };
      mockTaskService.delete.mockResolvedValue({ id: "task-1" });

      const result = await controller.remove("task-1", user);

      expect(mockTaskService.delete).toHaveBeenCalledWith("task-1", "user-1");
      expect(result).toEqual({ id: "task-1" });
    });
  });

  describe("batchDelete", () => {
    it("should delegate to taskService.batchDelete when called with ids and user", async () => {
      const user = { sub: "user-1", email: "test@example.com" };
      mockTaskService.batchDelete.mockResolvedValue({ count: 2 });

      const result = await controller.batchDelete({ ids: ["task-1", "task-2"] }, user);

      expect(mockTaskService.batchDelete).toHaveBeenCalledWith(["task-1", "task-2"], "user-1");
      expect(result).toEqual({ count: 2 });
    });
  });
});
