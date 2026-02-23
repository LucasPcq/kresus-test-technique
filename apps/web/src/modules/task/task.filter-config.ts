import type { Priority } from "@kresus/contract";
import { dateFilterOps, priorityFilterOps } from "@kresus/contract";

import { formatDateShort, parseLocalDate } from "@/lib/date";

import type { SelectOption } from "./task.constants";
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
  { value: false, labelKey: "filter.todo" },
  { value: true, labelKey: "filter.done" },
] as const satisfies ReadonlyArray<SelectOption<boolean>>;

const PRIORITY_VALUE_OPTIONS = [
  { value: "HIGH", labelKey: PRIORITY_CONFIG.HIGH.labelKey },
  { value: "MEDIUM", labelKey: PRIORITY_CONFIG.MEDIUM.labelKey },
  { value: "LOW", labelKey: PRIORITY_CONFIG.LOW.labelKey },
] as const satisfies ReadonlyArray<SelectOption<Priority>>;

// ---------------------------------------------------------------------------
// Field configuration
// ---------------------------------------------------------------------------

type SelectFieldConfig = {
  field: "completed" | "priority";
  labelKey: string;
  operators: ReadonlyArray<SelectOption>;
  defaultOperator: string;
  values: ReadonlyArray<SelectOption<unknown>>;
  valueType: "select";
};

type CalendarFieldConfig = {
  field: "executionDate";
  labelKey: string;
  operators: ReadonlyArray<SelectOption>;
  defaultOperator: string;
  valueType: "calendar";
};

export type FilterFieldConfig = SelectFieldConfig | CalendarFieldConfig;

export const FILTER_FIELD_CONFIGS: ReadonlyArray<FilterFieldConfig> = [
  {
    field: "completed",
    labelKey: "filter.completed",
    operators: [{ value: "eq", labelKey: "filter.eq" }],
    defaultOperator: "eq",
    values: COMPLETED_VALUE_OPTIONS,
    valueType: "select",
  },
  {
    field: "priority",
    labelKey: "filter.priority",
    operators: [
      { value: "eq", labelKey: "filter.eq" },
      { value: "neq", labelKey: "filter.neq" },
    ],
    defaultOperator: "eq",
    values: PRIORITY_VALUE_OPTIONS,
    valueType: "select",
  },
  {
    field: "executionDate",
    labelKey: "filter.executionDate",
    operators: [
      { value: "between", labelKey: "filter.between" },
      { value: "gte", labelKey: "filter.gte" },
      { value: "lte", labelKey: "filter.lte" },
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

type TranslateFunction = (key: string) => string;

const formatDateValue = (iso: string, locale: string) =>
  formatDateShort(parseLocalDate(iso), locale);

const formatDateFilterValue = (filter: DateFilter, locale: string): string => {
  switch (filter.operator) {
    case "between":
      return `${formatDateValue(filter.value.from, locale)} – ${formatDateValue(filter.value.to, locale)}`;
    case "gte":
      return formatDateValue(filter.value.from, locale);
    case "lte":
      return formatDateValue(filter.value.to, locale);
  }
};

export const formatFilterLabel = ({
  filter,
  t,
  locale = "fr-FR",
}: {
  filter: ActiveFilter;
  t: TranslateFunction;
  locale?: string;
}): string => {
  const config = getFieldConfig(filter.field);
  if (!config) return "";

  const fieldLabel = t(config.labelKey);
  const operatorLabel =
    config.operators.find((o) => o.value === filter.operator)?.labelKey ?? "";
  const operatorText = operatorLabel ? t(operatorLabel) : "";

  const valueLabel =
    config.valueType === "select"
      ? t(config.values.find((v) => v.value === filter.value)?.labelKey ?? "")
      : formatDateFilterValue(filter as DateFilter, locale);

  return `${fieldLabel} · ${operatorText} · ${valueLabel}`;
};
