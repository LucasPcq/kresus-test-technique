import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

const mockTaskService = {
  create: vi.fn(),
};

describe("TaskController", () => {
  let controller: TaskController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TaskController(mockTaskService as unknown as TaskService);
  });

  describe("create", () => {
    it("delegates to taskService.create with dto and userId", async () => {
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
});
