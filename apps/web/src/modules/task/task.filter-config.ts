import type { Priority } from "@kresus/contract";
import { dateFilterOps, priorityFilterOps } from "@kresus/contract";

import { formatDateShort, parseLocalDate } from "@/lib/date";

import { PRIORITY_CONFIG } from "./task.constants";

// ---------------------------------------------------------------------------
// Filter fields
// ---------------------------------------------------------------------------

const FILTER_FIELDS = {
  completed: "completed",
  priority: "priority",
  executionDate: "executionDate",
} as const;

export type FilterField = (typeof FILTER_FIELDS)[keyof typeof FILTER_FIELDS];

// ---------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------

type PriorityOperator = (typeof priorityFilterOps)[number];
type DateOperator = (typeof dateFilterOps)[number];

// ---------------------------------------------------------------------------
// Active filter (discriminated union)
// ---------------------------------------------------------------------------

type CompletedFilter = { field: "completed"; operator: "eq"; value: boolean };
type PriorityFilter = { field: "priority"; operator: PriorityOperator; value: Priority };

type DateBetweenFilter = {
  field: "executionDate";
  operator: "between";
  value: { from: string; to: string };
};
type DateGteFilter = { field: "executionDate"; operator: "gte"; value: { from: string } };
type DateLteFilter = { field: "executionDate"; operator: "lte"; value: { to: string } };
type DateFilter = DateBetweenFilter | DateGteFilter | DateLteFilter;

export type ActiveFilter = CompletedFilter | PriorityFilter | DateFilter;

// ---------------------------------------------------------------------------
// Value options
// ---------------------------------------------------------------------------

const COMPLETED_VALUE_OPTIONS = [
  { value: false, label: "À faire" },
  { value: true, label: "Terminées" },
] as const;

const PRIORITY_VALUE_OPTIONS = [
  { value: "HIGH" as const, label: PRIORITY_CONFIG.HIGH.label },
  { value: "MEDIUM" as const, label: PRIORITY_CONFIG.MEDIUM.label },
  { value: "LOW" as const, label: PRIORITY_CONFIG.LOW.label },
] as const;

// ---------------------------------------------------------------------------
// Field configuration
// ---------------------------------------------------------------------------

type SelectFieldConfig = {
  field: "completed" | "priority";
  label: string;
  operators: ReadonlyArray<{ value: string; label: string }>;
  defaultOperator: string;
  values: ReadonlyArray<{ value: unknown; label: string }>;
  valueType: "select";
};

type CalendarFieldConfig = {
  field: "executionDate";
  label: string;
  operators: ReadonlyArray<{ value: string; label: string }>;
  defaultOperator: string;
  valueType: "calendar";
};

export type FilterFieldConfig = SelectFieldConfig | CalendarFieldConfig;

export const FILTER_FIELD_CONFIGS: ReadonlyArray<FilterFieldConfig> = [
  {
    field: "completed",
    label: "Statut",
    operators: [{ value: "eq", label: "est" }],
    defaultOperator: "eq",
    values: COMPLETED_VALUE_OPTIONS,
    valueType: "select",
  },
  {
    field: "priority",
    label: "Priorité",
    operators: [
      { value: "eq", label: "est" },
      { value: "neq", label: "n'est pas" },
    ],
    defaultOperator: "eq",
    values: PRIORITY_VALUE_OPTIONS,
    valueType: "select",
  },
  {
    field: "executionDate",
    label: "Date d'exécution",
    operators: [
      { value: "between", label: "entre" },
      { value: "gte", label: "après le" },
      { value: "lte", label: "avant le" },
    ],
    defaultOperator: "between",
    valueType: "calendar",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const getFieldConfig = (field: FilterField): FilterFieldConfig | undefined =>
  FILTER_FIELD_CONFIGS.find((c) => c.field === field);

// ---------------------------------------------------------------------------
// Label formatting
// ---------------------------------------------------------------------------

const formatDateValue = (iso: string) => formatDateShort(parseLocalDate(iso));

const formatDateFilterValue = (filter: DateFilter): string => {
  switch (filter.operator) {
    case "between":
      return `${formatDateValue(filter.value.from)} – ${formatDateValue(filter.value.to)}`;
    case "gte":
      return formatDateValue(filter.value.from);
    case "lte":
      return formatDateValue(filter.value.to);
  }
};

export const formatFilterLabel = (filter: ActiveFilter): string => {
  const config = getFieldConfig(filter.field);
  if (!config) return "";

  const operatorLabel = config.operators.find((o) => o.value === filter.operator)?.label ?? "";

  const valueLabel =
    config.valueType === "select"
      ? (config.values.find((v) => v.value === filter.value)?.label ?? "")
      : formatDateFilterValue(filter as DateFilter);

  return `${config.label} · ${operatorLabel} · ${valueLabel}`;
};
