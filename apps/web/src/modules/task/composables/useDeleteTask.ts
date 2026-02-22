import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { deleteTask } from "../api/task.api";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tâche supprimée avec succès");
    },
  });
};
