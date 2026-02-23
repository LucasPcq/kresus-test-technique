import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import { batchDeleteTasks } from "../api/task.api";

import { applyOptimisticUpdate, rollbackOptimisticUpdate } from "./taskCacheUtils";

export const useBatchDeleteTasks = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

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
      toast.success(t("toast.batchDeleted", { count: ids.length }, ids.length));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
