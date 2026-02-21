import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";

const mockTaskRepository = {
  create: vi.fn(),
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
};

describe("TaskService", () => {
  let service: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TaskService(mockTaskRepository as unknown as TaskRepository);
  });

  describe("create", () => {
    const userId = "user-1";
    const baseDto = {
      title: "My task",
      content: "Some content",
      priority: "HIGH" as const,
      completed: false,
    };

    it("should pass dto with userId to repository when called", async () => {
      await service.create(baseDto, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: "My task",
        content: "Some content",
        priority: "HIGH",
        completedAt: null,
        userId,
      });
    });

    it("should set completedAt to current date when completed is true", async () => {
      const now = new Date("2026-01-01T00:00:00Z");
      vi.setSystemTime(now);

      await service.create({ ...baseDto, completed: true }, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ completedAt: now }),
      );

      vi.useRealTimers();
    });

    it("should set completedAt to null when completed is false", async () => {
      await service.create({ ...baseDto, completed: false }, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ completedAt: null }),
      );
    });

    it("should pass executionDate to repository when provided", async () => {
      const executionDate = new Date("2027-06-01");

      await service.create({ ...baseDto, executionDate }, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ executionDate }),
      );
    });
  });

  describe("findAll", () => {
    const userId = "user-1";
    const tasks = [{ id: "task-1" }, { id: "task-2" }];

    it("should return paginated response when tasks exist", async () => {
      mockTaskRepository.findByUserId.mockResolvedValue(tasks);
      mockTaskRepository.countByUserId.mockResolvedValue(12);

      const result = await service.findAll({ page: 1, pageSize: 10 }, userId);

      expect(result).toEqual({
        items: tasks,
        total: 12,
        page: 1,
        pageSize: 10,
        totalPages: 2,
      });
    });

    it("should calculate skip correctly when requesting page 3", async () => {
      mockTaskRepository.findByUserId.mockResolvedValue([]);
      mockTaskRepository.countByUserId.mockResolvedValue(0);

      await service.findAll({ page: 3, pageSize: 25 }, userId);

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, { skip: 50, take: 25 });
    });

    it("should round totalPages up when total is not divisible by pageSize", async () => {
      mockTaskRepository.findByUserId.mockResolvedValue([]);
      mockTaskRepository.countByUserId.mockResolvedValue(11);

      const result = await service.findAll({ page: 1, pageSize: 10 }, userId);

      expect(result.totalPages).toBe(2);
    });

    it("should return 0 totalPages when no tasks exist", async () => {
      mockTaskRepository.findByUserId.mockResolvedValue([]);
      mockTaskRepository.countByUserId.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, pageSize: 10 }, userId);

      expect(result.totalPages).toBe(0);
    });
  });
});
