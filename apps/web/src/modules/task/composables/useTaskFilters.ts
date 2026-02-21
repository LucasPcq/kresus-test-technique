import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { TaskQueryDto } from "@kresus/contract";

import { type PaginationMode } from "../task.constants";
import { TASK_QUERY_URL_KEYS, parseTaskQueryURL } from "../schemas/task-query.schema";

import { serializeBoolean } from "../utils/serialize";

export const useTaskFilters = () => {
  const route = useRoute();
  const router = useRouter();

  const filters = computed(() => parseTaskQueryURL(route.query));
  const paginationMode = computed(() => filters.value.mode);

  const hasActiveFilters = computed(() =>
    TASK_QUERY_URL_KEYS.some((key) => filters.value[key] !== undefined),
  );

  const queryParams = computed(
    (): TaskQueryDto => ({
      page: filters.value.page,
      pageSize: filters.value.pageSize,
      sort: filters.value.sort,
      filter: buildFilter(),
    }),
  );

  const updateQuery = (params: Record<string, string | undefined>) => {
    const newQuery = { ...route.query } as Record<string, string | undefined>;
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        delete newQuery[key];
      } else {
        newQuery[key] = value;
      }
    }
    router.replace({ query: newQuery });
  };

  const updateFilterQuery = (params: Record<string, string | undefined>) =>
    updateQuery({ ...params, page: "1" });

  const setPage = (n: number) => updateQuery({ page: String(n) });
  const setPageSize = (n: number) => updateFilterQuery({ pageSize: String(n) });
  const setPaginationMode = (m: PaginationMode) => updateFilterQuery({ mode: m });

  const setSort = (s: string) => updateFilterQuery({ sort: s });

  const setPriority = (v: string | undefined) => updateFilterQuery({ priority: v });

  const setTitleSearch = (v: string | undefined) => updateFilterQuery({ title: v || undefined });

  const setCompleted = (v: boolean | undefined) =>
    updateFilterQuery({ completed: serializeBoolean(v) });

  const setDateRange = ({ from, to }: { from: string | undefined; to: string | undefined }) =>
    updateFilterQuery({ dateFrom: from, dateTo: to });

  const resetFilters = () => {
    const filterKeys = new Set<string>(TASK_QUERY_URL_KEYS);
    const query = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => !filterKeys.has(key)),
    );
    router.replace({ query: { ...query, page: "1" } });
  };

  const buildExecutionDateFilter = (): TaskQueryDto["filter"] => {
    const { dateFrom, dateTo } = filters.value;
    if (dateFrom && dateTo)
      return { executionDate: { between: [new Date(dateFrom), new Date(dateTo)] } };
    if (dateFrom) return { executionDate: { gte: new Date(dateFrom) } };
    if (dateTo) return { executionDate: { lte: new Date(dateTo) } };
    return {};
  };

  const buildFilter = (): TaskQueryDto["filter"] => {
    const { completed, priority, title } = filters.value;
    const filter: TaskQueryDto["filter"] = {
      ...(completed !== undefined && { completed }),
      ...(priority && { priority: { eq: priority } }),
      ...(title && { title: { contains: title } }),
      ...buildExecutionDateFilter(),
    };
    return Object.keys(filter).length > 0 ? filter : undefined;
  };

  return {
    filters,
    paginationMode,
    queryParams,
    hasActiveFilters,
    setPage,
    setPageSize,
    setSort,
    setCompleted,
    setPriority,
    setTitleSearch,
    setDateRange,
    setPaginationMode,
    resetFilters,
  };
};
