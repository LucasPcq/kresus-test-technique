import { computed, type Ref } from "vue";
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";

import type { TaskQueryDto } from "@kresus/contract";

import { type PaginationMode, PAGINATION_MODE } from "../task.constants";
import { TASK_QUERY_KEYS } from "../queryKeys";

import { fetchTasks } from "../api/task.api";

export const useTaskList = ({
  queryParams,
  paginationMode,
}: {
  queryParams: Ref<TaskQueryDto>;
  paginationMode: Ref<PaginationMode>;
}) => {
  const isClassic = computed(() => paginationMode.value === PAGINATION_MODE.CLASSIC);
  const isInfinite = computed(() => paginationMode.value === PAGINATION_MODE.INFINITE);

  const classicQuery = useQuery({
    enabled: isClassic,
    queryKey: computed(() => TASK_QUERY_KEYS.list(queryParams.value)),
    queryFn: () => fetchTasks(queryParams.value),
    placeholderData: (prev) => prev,
  });

  const infiniteQuery = useInfiniteQuery({
    enabled: isInfinite,
    initialPageParam: 1,
    queryKey: computed(() => TASK_QUERY_KEYS.infinite(queryParams.value)),
    queryFn: ({ pageParam }) => fetchTasks({ ...queryParams.value, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    placeholderData: (prev) => prev,
  });

  const tasks = computed(() => {
    if (isClassic.value) return classicQuery.data.value?.items ?? [];
    return infiniteQuery.data.value?.pages.flatMap((p) => p.items) ?? [];
  });

  const total = computed(() => {
    if (isClassic.value) return classicQuery.data.value?.total ?? 0;
    return infiniteQuery.data.value?.pages[0]?.total ?? 0;
  });

  const totalPages = computed(() => {
    if (isClassic.value) return classicQuery.data.value?.totalPages ?? 0;
    return infiniteQuery.data.value?.pages[0]?.totalPages ?? 0;
  });

  const isPending = computed(() =>
    isClassic.value ? classicQuery.isPending.value : infiniteQuery.isPending.value,
  );

  const isFetching = computed(() =>
    isClassic.value ? classicQuery.isFetching.value : infiniteQuery.isFetching.value,
  );

  const isError = computed(() =>
    isClassic.value ? classicQuery.isError.value : infiniteQuery.isError.value,
  );

  return {
    tasks,
    total,
    totalPages,
    isPending,
    isFetching,
    isError,
    isClassic,
    isInfinite,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
  };
};
