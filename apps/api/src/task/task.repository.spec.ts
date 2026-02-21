import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service";
import { TaskRepository } from "./task.repository";

const mockPrisma = {
  task: {
    create: vi.fn(),
  },
};

describe("TaskRepository", () => {
  let repository: TaskRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new TaskRepository(mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("calls prisma.task.create with user connect", async () => {
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
});
