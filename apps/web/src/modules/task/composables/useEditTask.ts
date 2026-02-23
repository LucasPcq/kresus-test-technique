import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import type { UpdateTaskInput } from "@kresus/contract";

import { updateTask } from "../api/task.api";

import { applyOptimisticUpdate, rollbackOptimisticUpdate } from "./taskCacheUtils";

export const useEditTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateTaskInput & { id: string }) => updateTask(variables),
    onMutate: async ({ id, completed, ...fields }) => {
      const snapshot = await applyOptimisticUpdate({
        queryClient,
        updatePage: (page) => ({
          ...page,
          items: page.items.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...fields,
                  ...(completed !== undefined && {
                    completedAt: completed ? new Date() : null,
                  }),
                }
              : task,
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
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tâche modifiée avec succès");
    },
  });
};
