import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { pluralize } from "@/lib/utils";

import { batchDeleteTasks } from "../api/task.api";

export const useBatchDeleteTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: batchDeleteTasks,
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`${ids.length} ${pluralize(ids.length, "tâche")} ${pluralize(ids.length, "supprimée")}`);
    },
  });
};
