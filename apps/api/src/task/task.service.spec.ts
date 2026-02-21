import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";

const mockTaskRepository = {
  create: vi.fn(),
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

    it("creates a task with userId", async () => {
      await service.create(baseDto, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: "My task",
        content: "Some content",
        priority: "HIGH",
        completedAt: null,
        userId,
      });
    });

    it("sets completedAt to current date when completed is true", async () => {
      const now = new Date("2026-01-01T00:00:00Z");
      vi.setSystemTime(now);

      await service.create({ ...baseDto, completed: true }, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ completedAt: now }),
      );

      vi.useRealTimers();
    });

    it("sets completedAt to null when completed is false", async () => {
      await service.create({ ...baseDto, completed: false }, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ completedAt: null }),
      );
    });

    it("passes executionDate when provided", async () => {
      const executionDate = new Date("2027-06-01");

      await service.create({ ...baseDto, executionDate }, userId);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ executionDate }),
      );
    });
  });
});
