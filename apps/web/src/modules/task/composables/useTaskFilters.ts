import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { TaskQueryDto } from "@kresus/contract";

import { type PaginationMode } from "../task.constants";
import type { ActiveFilter, FilterField } from "../task.filter-config";
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

  const activeFilters = computed((): ActiveFilter[] => {
    const f = filters.value;
    const result: ActiveFilter[] = [];

    if (f.completed !== undefined) {
      result.push({ field: "completed", operator: "eq", value: f.completed });
    }

    if (f.priority) {
      result.push({ field: "priority", operator: f.priorityOp ?? "eq", value: f.priority });
    }

    if (f.dateFrom || f.dateTo) {
      const op = f.dateOp ?? "between";
      if (op === "between" && f.dateFrom && f.dateTo) {
        result.push({
          field: "executionDate",
          operator: "between",
          value: { from: f.dateFrom, to: f.dateTo },
        });
      } else if (op === "gte" && f.dateFrom) {
        result.push({
          field: "executionDate",
          operator: "gte",
          value: { from: f.dateFrom },
        });
      } else if (op === "lte" && f.dateTo) {
        result.push({
          field: "executionDate",
          operator: "lte",
          value: { to: f.dateTo },
        });
      }
    }

    return result;
  });

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

  const setTitleSearch = (v: string | undefined) => updateFilterQuery({ title: v || undefined });

  const setFilter = (filter: ActiveFilter) => {
    switch (filter.field) {
      case "completed":
        updateFilterQuery({ completed: serializeBoolean(filter.value) });
        break;
      case "priority":
        updateFilterQuery({ priority: filter.value, priorityOp: filter.operator });
        break;
      case "executionDate":
        if (filter.operator === "between") {
          updateFilterQuery({
            dateFrom: filter.value.from,
            dateTo: filter.value.to,
            dateOp: "between",
          });
        } else if (filter.operator === "gte") {
          updateFilterQuery({ dateFrom: filter.value.from, dateTo: undefined, dateOp: "gte" });
        } else if (filter.operator === "lte") {
          updateFilterQuery({ dateFrom: undefined, dateTo: filter.value.to, dateOp: "lte" });
        }
        break;
    }
  };

  const removeFilter = (field: FilterField) => {
    switch (field) {
      case "completed":
        updateFilterQuery({ completed: undefined });
        break;
      case "priority":
        updateFilterQuery({ priority: undefined, priorityOp: undefined });
        break;
      case "executionDate":
        updateFilterQuery({ dateFrom: undefined, dateTo: undefined, dateOp: undefined });
        break;
    }
  };

  const resetFilters = () => {
    const filterKeys = new Set<string>(TASK_QUERY_URL_KEYS);
    const query = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => !filterKeys.has(key)),
    );
    router.replace({ query: { ...query, page: "1" } });
  };

  const buildExecutionDateFilter = (): TaskQueryDto["filter"] => {
    const { dateFrom, dateTo, dateOp } = filters.value;

    if (dateOp === "between" && dateFrom && dateTo)
      return { executionDate: { between: [new Date(dateFrom), new Date(dateTo)] } };
    if (dateOp === "gte" && dateFrom) return { executionDate: { gte: new Date(dateFrom) } };
    if (dateOp === "lte" && dateTo) return { executionDate: { lte: new Date(dateTo) } };

    if (dateFrom && dateTo)
      return { executionDate: { between: [new Date(dateFrom), new Date(dateTo)] } };
    if (dateFrom) return { executionDate: { gte: new Date(dateFrom) } };
    if (dateTo) return { executionDate: { lte: new Date(dateTo) } };

    return {};
  };

  const buildFilter = (): TaskQueryDto["filter"] => {
    const { completed, priority, priorityOp, title } = filters.value;
    const filter: TaskQueryDto["filter"] = {
      ...(completed !== undefined && { completed: completed ? 1 : 0 }),
      ...(priority && { priority: { [priorityOp ?? "eq"]: priority } }),
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
