import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { deleteTask } from "../api/task.api";
import { TASK_QUERY_KEYS } from "../queryKeys";

import { applyOptimisticUpdate, rollbackOptimisticUpdate } from "./taskCacheUtils";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      const snapshot = await applyOptimisticUpdate({
        queryClient,
        updatePage: (page) => ({
          ...page,
          items: page.items.filter((task) => task.id !== id),
          total: page.total - 1,
        }),
      });
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        rollbackOptimisticUpdate({ queryClient, snapshot: context.snapshot });
      }
    },
    onSuccess: () => {
      toast.success("Tâche supprimée avec succès");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    },
  });
};
