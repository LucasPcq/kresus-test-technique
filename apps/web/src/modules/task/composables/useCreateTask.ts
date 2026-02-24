import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { createTask } from "../api/task.api";
import { TASK_QUERY_KEYS } from "../queryKeys";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { suppressErrorToast: true },
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      toast.success("Tâche créée avec succès");
    },
  });
};
