import type { Priority, SortValue } from "@kresus/contract";
import { PRIORITY, SORT_FIELDS } from "@kresus/contract";

import type { BadgeVariants } from "@/components/ui/badge";

export const PAGINATION_MODE = {
  CLASSIC: "classic",
  INFINITE: "infinite",
} as const;

export const PAGINATION_MODES = Object.values(PAGINATION_MODE);
export type PaginationMode = (typeof PAGINATION_MODE)[keyof typeof PAGINATION_MODE];

export const SEARCH_DEBOUNCE_MS = 300;

export type SelectOption<V = string> = { value: V; labelKey: string };

export const PRIORITY_CONFIG: Record<
  Priority,
  { labelKey: string; variant: NonNullable<BadgeVariants["variant"]> }
> = {
  [PRIORITY.HIGH]: { labelKey: "priority.HIGH", variant: "destructive" },
  [PRIORITY.MEDIUM]: { labelKey: "priority.MEDIUM", variant: "default" },
  [PRIORITY.LOW]: { labelKey: "priority.LOW", variant: "secondary" },
};

const SORT_LABEL_KEYS: Record<(typeof SORT_FIELDS)[number], string> = {
  createdAt: "sort.createdAt",
  executionDate: "sort.executionDate",
  priority: "sort.priority",
};

export const SORT_OPTIONS = SORT_FIELDS.flatMap((field) => [
  { value: `-${field}` as const, labelKey: SORT_LABEL_KEYS[field], direction: "↓" as const },
  { value: field, labelKey: SORT_LABEL_KEYS[field], direction: "↑" as const },
]) satisfies Array<SelectOption<SortValue> & { direction: string }>;
