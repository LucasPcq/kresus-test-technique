import { computed } from "vue";

import type { ActiveFilter, FilterField } from "../task.filter-config";
import { FILTER_URL_KEYS, TASK_QUERY_URL_KEYS } from "../task.filter-config";

import type { TaskQueryURL } from "../schemas/task-query.schema";

import { serializeBoolean } from "../utils/serialize";
import { useTaskQuery } from "./useTaskQuery";

type DateFilter = Extract<ActiveFilter, { field: "executionDate" }>;

export const useTaskFilters = () => {
  const {
    filters,
    paginationMode,
    queryParams,
    updateFilterQuery,
    setPage,
    setPageSize,
    setPaginationMode,
    setSort,
    setTitleSearch,
  } = useTaskQuery();

  // ---------------------------------------------------------------------------
  // Active filters (UI representation)
  // ---------------------------------------------------------------------------

  const hasActiveFilters = computed(() =>
    TASK_QUERY_URL_KEYS.some((key) => filters.value[key as keyof TaskQueryURL] !== undefined),
  );

  const buildDateActiveFilter = (parsed: TaskQueryURL): ActiveFilter | undefined => {
    if (parsed.dateOp === "between" && parsed.dateFrom && parsed.dateTo) {
      return {
        field: "executionDate",
        operator: "between",
        value: { from: parsed.dateFrom, to: parsed.dateTo },
      };
    }
    if (parsed.dateOp === "gte" && parsed.dateFrom) {
      return { field: "executionDate", operator: "gte", value: { from: parsed.dateFrom } };
    }
    if (parsed.dateOp === "lte" && parsed.dateTo) {
      return { field: "executionDate", operator: "lte", value: { to: parsed.dateTo } };
    }
  };

  const activeFilters = computed((): ActiveFilter[] => {
    const parsed = filters.value;
    const result: ActiveFilter[] = [];

    if (parsed.completed !== undefined) {
      result.push({ field: "completed", operator: "eq", value: parsed.completed });
    }

    if (parsed.priority) {
      result.push({ field: "priority", operator: parsed.priorityOp, value: parsed.priority });
    }

    if (parsed.dateFrom || parsed.dateTo) {
      const dateFilter = buildDateActiveFilter(parsed);
      if (dateFilter) result.push(dateFilter);
    }

    return result;
  });

  // ---------------------------------------------------------------------------
  // Filter mutations
  // ---------------------------------------------------------------------------

  const serializeDateFilter = (filter: DateFilter): Record<string, string | undefined> => {
    if (filter.operator === "between") {
      return { dateFrom: filter.value.from, dateTo: filter.value.to, dateOp: "between" };
    }
    if (filter.operator === "gte") {
      return { dateFrom: filter.value.from, dateTo: undefined, dateOp: "gte" };
    }
    return { dateFrom: undefined, dateTo: filter.value.to, dateOp: "lte" };
  };

  const setFilter = (filter: ActiveFilter) => {
    if (filter.field === "completed") {
      updateFilterQuery({ completed: serializeBoolean(filter.value) });
      return;
    }
    if (filter.field === "priority") {
      updateFilterQuery({ priority: filter.value, priorityOp: filter.operator });
      return;
    }
    updateFilterQuery(serializeDateFilter(filter));
  };

  const removeFilter = (field: FilterField) => {
    const params = Object.fromEntries(FILTER_URL_KEYS[field].map((key) => [key, undefined]));
    updateFilterQuery(params);
  };

  const resetFilters = () => {
    const params = Object.fromEntries(TASK_QUERY_URL_KEYS.map((key) => [key, undefined]));
    updateFilterQuery(params as Record<string, undefined>);
  };

  return {
    filters,
    paginationMode,
    queryParams,
    hasActiveFilters,
    activeFilters,
    setPage,
    setPageSize,
    setSort,
    setFilter,
    removeFilter,
    setTitleSearch,
    setPaginationMode,
    resetFilters,
  };
};
