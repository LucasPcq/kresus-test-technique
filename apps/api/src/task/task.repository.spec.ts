import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "../prisma/prisma.service";
import { TaskRepository } from "./task.repository";

const mockPrisma = {
  task: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe("TaskRepository", () => {
  let repository: TaskRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new TaskRepository(mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("should call prisma.task.create with user connect when given input", async () => {
      const input = {
        title: "My task",
        content: "Some content",
        priority: "HIGH" as const,
        userId: "user-1",
      };
      const created = { id: "task-1", ...input, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.task.create.mockResolvedValue(created);

      const result = await repository.create(input);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "My task",
          content: "Some content",
          priority: "HIGH",
          user: { connect: { id: "user-1" } },
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe("findMany", () => {
    it("should pass where, skip, take and orderBy to prisma when called", async () => {
      const tasks = [{ id: "task-1" }];
      const where = { userId: "user-1", priority: { equals: "HIGH" } };
      const orderBy = { createdAt: "desc" as const };
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await repository.findMany({ where, skip: 0, take: 10, orderBy });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where,
        skip: 0,
        take: 10,
        orderBy,
      });
      expect(result).toEqual(tasks);
    });
  });

  describe("count", () => {
    it("should pass where to prisma.task.count when called", async () => {
      const where = { userId: "user-1" };
      mockPrisma.task.count.mockResolvedValue(5);

      const result = await repository.count(where);

      expect(mockPrisma.task.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(5);
    });
  });

  describe("findById", () => {
    it("should call prisma.task.findUnique with id when called", async () => {
      const task = { id: "task-1", title: "My task" };
      mockPrisma.task.findUnique.mockResolvedValue(task);

      const result = await repository.findById("task-1");

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: "task-1" } });
      expect(result).toEqual(task);
    });
  });

  describe("update", () => {
    it("should call prisma.task.update with id, userId and data when called", async () => {
      const updated = { id: "task-1", title: "Updated" };
      mockPrisma.task.update.mockResolvedValue(updated);

      const result = await repository.update({ id: "task-1", userId: "user-1" }, { title: "Updated" });

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1", userId: "user-1" },
        data: { title: "Updated" },
      });
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should call prisma.task.delete with id and userId when called", async () => {
      const deleted = { id: "task-1" };
      mockPrisma.task.delete.mockResolvedValue(deleted);

      const result = await repository.delete({ id: "task-1", userId: "user-1" });

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1", userId: "user-1" },
      });
      expect(result).toEqual(deleted);
    });
  });

  describe("deleteMany", () => {
    it("should call prisma.task.deleteMany with ids and userId filter when called", async () => {
      mockPrisma.task.deleteMany.mockResolvedValue({ count: 2 });

      const result = await repository.deleteMany({ ids: ["task-1", "task-2"], userId: "user-1" });

      expect(mockPrisma.task.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["task-1", "task-2"] }, userId: "user-1" },
      });
      expect(result).toEqual({ count: 2 });
    });

    it("should use transaction client when provided", async () => {
      const mockTx = { task: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) } };

      const result = await repository.deleteMany(
        { ids: ["task-1"], userId: "user-1" },
        mockTx as never,
      );

      expect(mockTx.task.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["task-1"] }, userId: "user-1" },
      });
      expect(mockPrisma.task.deleteMany).not.toHaveBeenCalled();
      expect(result).toEqual({ count: 1 });
    });
  });

  describe("transaction", () => {
    it("should delegate to prisma.$transaction when called", async () => {
      const fn = vi.fn().mockResolvedValue("result");
      mockPrisma.$transaction.mockImplementation((cb: (tx: unknown) => unknown) => cb("tx-client"));

      const result = await repository.transaction(fn);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(fn);
      expect(result).toBe("result");
    });
  });
});
