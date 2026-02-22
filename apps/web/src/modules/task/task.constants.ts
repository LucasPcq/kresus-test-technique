import type { Priority } from "@kresus/contract";
import { PRIORITY, SORT_FIELDS } from "@kresus/contract";

import type { BadgeVariants } from "@/components/ui/badge";

export const PAGINATION_MODES = ["classic", "infinite"] as const;
export type PaginationMode = (typeof PAGINATION_MODES)[number];

export const SEARCH_DEBOUNCE_MS = 300;

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; variant: NonNullable<BadgeVariants["variant"]> }
> = {
  [PRIORITY.HIGH]: { label: "Haute", variant: "destructive" },
  [PRIORITY.MEDIUM]: { label: "Moyenne", variant: "default" },
  [PRIORITY.LOW]: { label: "Basse", variant: "secondary" },
};

export const PRIORITY_OPTIONS = [
  { value: "all", label: "Toutes" },
  ...Object.entries(PRIORITY_CONFIG).map(([value, { label }]) => ({
    value,
    label,
  })),
];

export const COMPLETED_OPTIONS = [
  { value: "all", label: "Toutes" },
  { value: "false", label: "À faire" },
  { value: "true", label: "Terminées" },
];

const SORT_LABELS: Record<(typeof SORT_FIELDS)[number], string> = {
  createdAt: "Date de création",
  executionDate: "Date d'exécution",
  priority: "Priorité",
};

export const SORT_OPTIONS = SORT_FIELDS.flatMap((field) => [
  { value: `-${field}`, label: `${SORT_LABELS[field]} ↓` },
  { value: field, label: `${SORT_LABELS[field]} ↑` },
]);
