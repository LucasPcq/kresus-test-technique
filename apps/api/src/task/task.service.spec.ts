import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";

const mockTaskRepository = {
  create: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
};

describe("TaskService", () => {
  let service: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskRepository.findMany.mockResolvedValue([]);
    mockTaskRepository.count.mockResolvedValue(0);
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
    const baseQuery = { page: 1, pageSize: 10 as const };

    it("should return paginated response when tasks exist", async () => {
      const tasks = [{ id: "task-1" }, { id: "task-2" }];
      mockTaskRepository.findMany.mockResolvedValue(tasks);
      mockTaskRepository.count.mockResolvedValue(12);

      const result = await service.findAll(baseQuery, userId);

      expect(result).toEqual({
        items: tasks,
        total: 12,
        page: 1,
        pageSize: 10,
        totalPages: 2,
      });
    });

    it("should calculate skip correctly when requesting page 3", async () => {
      await service.findAll({ ...baseQuery, page: 3, pageSize: 25 }, userId);

      expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 50, take: 25 }),
      );
    });

    it("should round totalPages up when total is not divisible by pageSize", async () => {
      mockTaskRepository.count.mockResolvedValue(11);

      const result = await service.findAll(baseQuery, userId);

      expect(result.totalPages).toBe(2);
    });

    it("should return 0 totalPages when no tasks exist", async () => {
      const result = await service.findAll(baseQuery, userId);

      expect(result.totalPages).toBe(0);
    });

    describe("sort", () => {
      it("should sort by createdAt desc when no sort provided", async () => {
        await service.findAll(baseQuery, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: "desc" } }),
        );
      });

      it("should sort ascending when sort has no prefix", async () => {
        await service.findAll({ ...baseQuery, sort: "executionDate" }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { executionDate: "asc" } }),
        );
      });

      it("should sort descending when sort has - prefix", async () => {
        await service.findAll({ ...baseQuery, sort: "-priority" }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { priority: "desc" } }),
        );
      });
    });

    describe("filter", () => {
      it("should filter by userId only when no filter provided", async () => {
        await service.findAll(baseQuery, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId } }),
        );
      });

      it("should filter completed tasks when completed is true", async () => {
        await service.findAll({ ...baseQuery, filter: { completed: true } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, completedAt: { not: null } } }),
        );
      });

      it("should filter incomplete tasks when completed is false", async () => {
        await service.findAll({ ...baseQuery, filter: { completed: false } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, completedAt: null } }),
        );
      });

      it("should filter by priority eq when priority eq provided", async () => {
        await service.findAll({ ...baseQuery, filter: { priority: { eq: "HIGH" } } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, priority: { equals: "HIGH" } } }),
        );
      });

      it("should filter by priority neq when priority neq provided", async () => {
        await service.findAll({ ...baseQuery, filter: { priority: { neq: "LOW" } } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, priority: { not: "LOW" } } }),
        );
      });

      it("should filter by executionDate gte when gte provided", async () => {
        const date = new Date("2026-03-01");
        await service.findAll({ ...baseQuery, filter: { executionDate: { gte: date } } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, executionDate: { gte: date } } }),
        );
      });

      it("should filter by executionDate between when between provided", async () => {
        const from = new Date("2026-03-01");
        const to = new Date("2026-06-01");
        await service.findAll(
          { ...baseQuery, filter: { executionDate: { between: [from, to] } } },
          userId,
        );

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId, executionDate: { gte: from, lte: to } } }),
        );
      });

      it("should filter by title contains case-insensitive when contains provided", async () => {
        await service.findAll({ ...baseQuery, filter: { title: { contains: "rapport" } } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId, title: { contains: "rapport", mode: "insensitive" } },
          }),
        );
      });

      it("should filter by title startsWith case-insensitive when startsWith provided", async () => {
        await service.findAll({ ...baseQuery, filter: { title: { startsWith: "rap" } } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId, title: { startsWith: "rap", mode: "insensitive" } },
          }),
        );
      });

      it("should filter by title neq case-insensitive when neq provided", async () => {
        await service.findAll({ ...baseQuery, filter: { title: { neq: "old task" } } }, userId);

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId, title: { not: "old task", mode: "insensitive" } },
          }),
        );
      });

      it("should filter by title notContains case-insensitive when notContains provided", async () => {
        await service.findAll(
          { ...baseQuery, filter: { title: { notContains: "draft" } } },
          userId,
        );

        expect(mockTaskRepository.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId, title: { not: { contains: "draft" }, mode: "insensitive" } },
          }),
        );
      });
    });
  });

  describe("update", () => {
    const userId = "user-1";
    const taskId = "task-1";
    const prismaNotFound = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "5.0.0",
    });

    it("should throw NotFoundException when task is not found or not owned", async () => {
      mockTaskRepository.update.mockRejectedValue(prismaNotFound);

      await expect(service.update(taskId, { title: "New" }, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should rethrow non-Prisma errors", async () => {
      mockTaskRepository.update.mockRejectedValue(new Error("DB connection lost"));

      await expect(service.update(taskId, { title: "New" }, userId)).rejects.toThrow(
        "DB connection lost",
      );
    });

    it("should pass fields to repository with compound where when updating", async () => {
      mockTaskRepository.update.mockResolvedValue({ id: taskId, title: "New" });

      await service.update(taskId, { title: "New" }, userId);

      expect(mockTaskRepository.update).toHaveBeenCalledWith({ id: taskId, userId }, { title: "New" });
    });

    it("should set completedAt to current date when completed is true", async () => {
      const now = new Date("2026-01-01T00:00:00Z");
      vi.setSystemTime(now);
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, { completed: true }, userId);

      expect(mockTaskRepository.update).toHaveBeenCalledWith({ id: taskId, userId }, { completedAt: now });
      vi.useRealTimers();
    });

    it("should set completedAt to null when completed is false", async () => {
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, { completed: false }, userId);

      expect(mockTaskRepository.update).toHaveBeenCalledWith({ id: taskId, userId }, { completedAt: null });
    });

    it("should not include completedAt when completed is undefined", async () => {
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, { title: "New" }, userId);

      expect(mockTaskRepository.update).toHaveBeenCalledWith({ id: taskId, userId }, { title: "New" });
    });
  });

  describe("delete", () => {
    const userId = "user-1";
    const taskId = "task-1";
    const prismaNotFound = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "5.0.0",
    });

    it("should throw NotFoundException when task is not found or not owned", async () => {
      mockTaskRepository.delete.mockRejectedValue(prismaNotFound);

      await expect(service.delete(taskId, userId)).rejects.toThrow(NotFoundException);
    });

    it("should rethrow non-Prisma errors", async () => {
      mockTaskRepository.delete.mockRejectedValue(new Error("DB connection lost"));

      await expect(service.delete(taskId, userId)).rejects.toThrow("DB connection lost");
    });

    it("should call repository.delete with compound where when task exists and is owned", async () => {
      mockTaskRepository.delete.mockResolvedValue({ id: taskId });

      await service.delete(taskId, userId);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith({ id: taskId, userId });
    });
  });

  describe("batchDelete", () => {
    const userId = "user-1";

    it("should throw NotFoundException when some ids are not found", async () => {
      mockTaskRepository.findManyByIds.mockResolvedValue([{ id: "task-1", userId }]);

      await expect(service.batchDelete(["task-1", "task-2"], userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when some tasks are not owned", async () => {
      mockTaskRepository.findManyByIds.mockResolvedValue([
        { id: "task-1", userId },
        { id: "task-2", userId: "other-user" },
      ]);

      await expect(service.batchDelete(["task-1", "task-2"], userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should call repository.deleteMany when all tasks exist and are owned", async () => {
      const ids = ["task-1", "task-2"];
      mockTaskRepository.findManyByIds.mockResolvedValue([
        { id: "task-1", userId },
        { id: "task-2", userId },
      ]);
      mockTaskRepository.deleteMany.mockResolvedValue({ count: 2 });

      await service.batchDelete(ids, userId);

      expect(mockTaskRepository.deleteMany).toHaveBeenCalledWith(ids);
    });
  });
});
