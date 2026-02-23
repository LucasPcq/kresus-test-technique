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
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      const created = { id: "550e8400-e29b-41d4-a716-446655440101", ...dto };
      mockTaskService.create.mockResolvedValue(created);

      const result = await controller.create(dto, user);

      expect(mockTaskService.create).toHaveBeenCalledWith(dto, "550e8400-e29b-41d4-a716-446655440001");
      expect(result).toEqual(created);
    });
  });

  describe("findAll", () => {
    it("should delegate to taskService.findAll when called with query and user", async () => {
      const query = { page: 1, pageSize: 10 as const };
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      const paginated = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
      mockTaskService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(query, user);

      expect(mockTaskService.findAll).toHaveBeenCalledWith(query, "550e8400-e29b-41d4-a716-446655440001");
      expect(result).toEqual(paginated);
    });

    it("should pass filters to taskService.findAll when filters provided", async () => {
      const query = {
        page: 1,
        pageSize: 10 as const,
        sort: "-priority",
        filter: { completed: true, priority: { eq: "HIGH" as const } },
      };
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      mockTaskService.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await controller.findAll(query, user);

      expect(mockTaskService.findAll).toHaveBeenCalledWith(query, "550e8400-e29b-41d4-a716-446655440001");
    });
  });

  describe("update", () => {
    it("should delegate to taskService.update when called with id, dto and user", async () => {
      const dto = { title: "Updated task" };
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      const updated = { id: "550e8400-e29b-41d4-a716-446655440101", ...dto };
      mockTaskService.update.mockResolvedValue(updated);

      const result = await controller.update("550e8400-e29b-41d4-a716-446655440101", dto, user);

      expect(mockTaskService.update).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440101", dto, "550e8400-e29b-41d4-a716-446655440001");
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("should delegate to taskService.delete when called with id and user", async () => {
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      mockTaskService.delete.mockResolvedValue({ id: "550e8400-e29b-41d4-a716-446655440101" });

      const result = await controller.remove("550e8400-e29b-41d4-a716-446655440101", user);

      expect(mockTaskService.delete).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440101", "550e8400-e29b-41d4-a716-446655440001");
      expect(result).toEqual({ id: "550e8400-e29b-41d4-a716-446655440101" });
    });
  });

  describe("batchDelete", () => {
    it("should delegate to taskService.batchDelete when called with ids and user", async () => {
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      mockTaskService.batchDelete.mockResolvedValue({ count: 2 });

      const result = await controller.batchDelete({ ids: ["550e8400-e29b-41d4-a716-446655440101", "550e8400-e29b-41d4-a716-446655440102"] }, user);

      expect(mockTaskService.batchDelete).toHaveBeenCalledWith(["550e8400-e29b-41d4-a716-446655440101", "550e8400-e29b-41d4-a716-446655440102"], "550e8400-e29b-41d4-a716-446655440001");
      expect(result).toEqual({ count: 2 });
    });
  });
});
