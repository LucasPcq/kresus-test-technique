import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import { deleteTask } from "../api/task.api";

import { applyOptimisticUpdate, rollbackOptimisticUpdate } from "./taskCacheUtils";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

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
      toast.success(t("toast.taskDeleted"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
