import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { updateTask } from "../api/task.api";
import { TASK_QUERY_KEYS } from "../queryKeys";

import { applyOptimisticUpdate, rollbackOptimisticUpdate } from "./taskCacheUtils";

export const useToggleTaskComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => {
      return updateTask({ id, completed });
    },
    onMutate: async ({ id, completed }) => {
      const snapshot = await applyOptimisticUpdate({
        queryClient,
        updatePage: (page) => ({
          ...page,
          items: page.items.map((task) =>
            task.id === id ? { ...task, completedAt: completed ? new Date() : null } : task,
          ),
        }),
      });
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        rollbackOptimisticUpdate({ queryClient, snapshot: context.snapshot });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    },
  });
};
