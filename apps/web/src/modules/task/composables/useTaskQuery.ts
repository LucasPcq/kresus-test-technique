import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { TaskFilterInput, TaskQueryInput, SortValue } from "@kresus/contract";

import type { PaginationMode } from "../task.constants";
import { parseTaskQueryURL } from "../schemas/task-query.schema";

export const useTaskQuery = () => {
  const route = useRoute();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Parsed URL state
  // ---------------------------------------------------------------------------

  const filters = computed(() => parseTaskQueryURL(route.query));
  const paginationMode = computed(() => filters.value.mode);

  // ---------------------------------------------------------------------------
  // URL updates
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Pagination & sort setters
  // ---------------------------------------------------------------------------

  const setPage = (page: number) => updateQuery({ page: String(page) });
  const setPageSize = (size: number) => updateFilterQuery({ pageSize: String(size) });
  const setPaginationMode = (mode: PaginationMode) => updateFilterQuery({ mode });
  const setSort = (sort: SortValue) => updateFilterQuery({ sort });

  const setTitleSearch = (title: string | undefined) =>
    updateFilterQuery({ title: title || undefined });

  // ---------------------------------------------------------------------------
  // API query building
  // ---------------------------------------------------------------------------

  const buildExecutionDateFilter = (): TaskFilterInput => {
    const { dateFrom, dateTo, dateOp } = filters.value;

    if (dateOp === "between" && dateFrom && dateTo) {
      return { executionDate: { between: [new Date(dateFrom), new Date(dateTo)] } };
    }
    if (dateOp === "gte" && dateFrom) {
      return { executionDate: { gte: new Date(dateFrom) } };
    }
    if (dateOp === "lte" && dateTo) {
      return { executionDate: { lte: new Date(dateTo) } };
    }

    return {};
  };

  const buildFilter = (): TaskFilterInput | undefined => {
    const { completed, priority, priorityOp, title } = filters.value;
    const filter: TaskFilterInput = { ...buildExecutionDateFilter() };

    if (completed !== undefined) {
      filter.completed = completed ? 1 : 0;
    }

    if (priority) {
      filter.priority = { [priorityOp]: priority };
    }

    if (title) {
      filter.title = { contains: title };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  };

  const queryParams = computed(
    (): TaskQueryInput => ({
      page: filters.value.page,
      pageSize: filters.value.pageSize,
      sort: filters.value.sort,
      filter: buildFilter(),
    }),
  );

  return {
    filters,
    paginationMode,
    queryParams,
    updateFilterQuery,
    setPage,
    setPageSize,
    setPaginationMode,
    setSort,
    setTitleSearch,
  };
};
