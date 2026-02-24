import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { pluralize } from "@/lib/utils";

import { batchDeleteTasks } from "../api/task.api";
import { TASK_QUERY_KEYS } from "../queryKeys";

import { applyOptimisticUpdate, rollbackOptimisticUpdate } from "./taskCacheUtils";

export const useBatchDeleteTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: batchDeleteTasks,
    onMutate: async (ids) => {
      const idSet = new Set(ids);
      const snapshot = await applyOptimisticUpdate({
        queryClient,
        updatePage: (page) => {
          const remaining = page.items.filter((task) => !idSet.has(task.id));
          return {
            ...page,
            items: remaining,
            total: page.total - (page.items.length - remaining.length),
          };
        },
      });
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        rollbackOptimisticUpdate({ queryClient, snapshot: context.snapshot });
      }
    },
    onSuccess: (_data, ids) => {
      toast.success(
        `${ids.length} ${pluralize(ids.length, "tâche")} ${pluralize(ids.length, "supprimée")}`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    },
  });
};
