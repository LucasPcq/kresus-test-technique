import type { QueryClient, QueryKey } from "@tanstack/vue-query";

import type { PaginatedResponse, TaskResponse } from "@kresus/contract";

export type TaskPage = PaginatedResponse<TaskResponse>;
export type TaskQuerySnapshot = [QueryKey, TaskPage | { pages: TaskPage[] } | undefined][];

export const applyOptimisticUpdate = async ({
  queryClient,
  updatePage,
}: {
  queryClient: QueryClient;
  updatePage: (page: TaskPage) => TaskPage;
}): Promise<TaskQuerySnapshot> => {
  await queryClient.cancelQueries({ queryKey: ["tasks"] });

  const snapshot = queryClient.getQueriesData<TaskPage | { pages: TaskPage[] }>({
    queryKey: ["tasks"],
  });

  queryClient.setQueriesData<TaskPage>(
    { queryKey: ["tasks", "list"] },
    (old) => old && updatePage(old),
  );

  queryClient.setQueriesData<{ pages: TaskPage[] }>(
    { queryKey: ["tasks", "infinite"] },
    (old) => old && { ...old, pages: old.pages.map(updatePage) },
  );

  return snapshot;
};

export const rollbackOptimisticUpdate = ({
  queryClient,
  snapshot,
}: {
  queryClient: QueryClient;
  snapshot: TaskQuerySnapshot;
}) => {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
};
