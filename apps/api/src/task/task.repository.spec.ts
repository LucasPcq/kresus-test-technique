import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service";
import { TaskRepository } from "./task.repository";

const mockPrisma = {
  task: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
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

  describe("findByUserId", () => {
    it("should return tasks ordered by createdAt desc when given userId and pagination", async () => {
      const tasks = [{ id: "task-1" }];
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await repository.findByUserId("user-1", { skip: 0, take: 10 });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(tasks);
    });
  });

  describe("countByUserId", () => {
    it("should return task count when given userId", async () => {
      mockPrisma.task.count.mockResolvedValue(5);

      const result = await repository.countByUserId("user-1");

      expect(mockPrisma.task.count).toHaveBeenCalledWith({ where: { userId: "user-1" } });
      expect(result).toBe(5);
    });
  });
});
