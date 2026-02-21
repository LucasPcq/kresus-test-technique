<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";

import { priorityValues, type Priority } from "@kresus/contract";

import { CalendarDays, RotateCcw, Search } from "lucide-vue-next";
import type { AcceptableValue, DateRange } from "reka-ui";

import { type DateValue, parseDate } from "@internationalized/date";
import { formatDateShort, parseLocalDate } from "@/lib/date";

import { COMPLETED_OPTIONS, PRIORITY_OPTIONS, SEARCH_DEBOUNCE_MS } from "../task.constants";

import { RangeCalendar } from "@/components/ui/range-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps<{
  titleSearch: string | undefined;
  completed: boolean | undefined;
  priority: Priority | undefined;
  dateFrom: string | undefined;
  dateTo: string | undefined;
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  "update:titleSearch": [value: string | undefined];
  "update:completed": [value: boolean | undefined];
  "update:priority": [value: Priority | undefined];
  "update:dateRange": [range: { from: string | undefined; to: string | undefined }];
  "reset-filters": [];
}>();

const localTitle = ref(props.titleSearch ?? "");

watch(
  () => props.titleSearch,
  (v) => {
    localTitle.value = v ?? "";
  },
);

watchDebounced(localTitle, (v) => emit("update:titleSearch", v || undefined), {
  debounce: SEARCH_DEBOUNCE_MS,
});

const completedValue = ref(props.completed === undefined ? "all" : String(props.completed));

watch(
  () => props.completed,
  (v) => {
    completedValue.value = v === undefined ? "all" : String(v);
  },
);

const onCompletedChange = (val: AcceptableValue | AcceptableValue[]) => {
  if (typeof val !== "string") return;
  completedValue.value = val;
  emit("update:completed", val === "all" ? undefined : val === "true");
};

const priorityValue = ref(props.priority ?? "all");

watch(
  () => props.priority,
  (v) => {
    priorityValue.value = v ?? "all";
  },
);

const isPriority = (val: string): val is Priority => priorityValues.some((p) => p === val);

const onPriorityChange = (val: AcceptableValue | AcceptableValue[]) => {
  if (typeof val !== "string") return;
  priorityValue.value = val;
  emit("update:priority", isPriority(val) ? val : undefined);
};

const toDateValue = (iso: string | undefined): DateValue | undefined => {
  if (!iso) return undefined;
  return parseDate(iso.slice(0, 10));
};

const calendarRange = ref<DateRange>({
  start: toDateValue(props.dateFrom),
  end: toDateValue(props.dateTo),
});

watch(
  () => [props.dateFrom, props.dateTo],
  ([from, to]) => {
    calendarRange.value = {
      start: toDateValue(from),
      end: toDateValue(to),
    };
  },
);

const onDateRangeChange = (range: DateRange) => {
  calendarRange.value = range;
  if (!range.start || !range.end) return;
  emit("update:dateRange", { from: range.start.toString(), to: range.end.toString() });
};

const onDatePopoverChange = (open: boolean) => {
  if (open) return;
  const { start, end } = calendarRange.value;
  if (start && !end) {
    const date = start.toString();
    emit("update:dateRange", { from: date, to: date });
  }
};

const formatDate = (iso: string) => formatDateShort(parseLocalDate(iso));

const dateButtonLabel = computed(() => {
  const { dateFrom, dateTo } = props;
  if (!dateFrom && !dateTo) return "Date d'exécution";
  if (dateFrom && dateTo && dateFrom === dateTo) return formatDate(dateFrom);
  if (dateFrom && dateTo) return `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;
  if (dateFrom) return `Depuis ${formatDate(dateFrom)}`;
  if (dateTo) return `Jusqu'au ${formatDate(dateTo)}`;
  return "Date d'exécution";
});

const hasDateRange = computed(() => !!props.dateFrom || !!props.dateTo);

const clearDateRange = () => {
  calendarRange.value = { start: undefined, end: undefined };
  emit("update:dateRange", { from: undefined, to: undefined });
};
</script>

<template>
  <div class="space-y-4">
    <div class="relative">
      <Search class="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        v-model="localTitle"
        placeholder="Rechercher une tâche…"
        class="pl-9"
      />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <ToggleGroup
        type="single"
        :model-value="completedValue"
        @update:model-value="onCompletedChange"
        variant="outline"
      >
        <ToggleGroupItem
          v-for="opt in COMPLETED_OPTIONS"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </ToggleGroupItem>
      </ToggleGroup>

      <Select :model-value="priorityValue" @update:model-value="onPriorityChange">
        <SelectTrigger class="w-36">
          <SelectValue placeholder="Priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="opt in PRIORITY_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Popover @update:open="onDatePopoverChange">
        <PopoverTrigger as-child>
          <Button variant="outline" class="gap-1.5">
            <CalendarDays class="size-4" />
            {{ dateButtonLabel }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
          <div class="p-3">
            <!-- @vue-ignore Volar false positive: #private fields in @internationalized/date break structural check on DateValue union -->
            <RangeCalendar
              :model-value="calendarRange"
              @update:model-value="onDateRangeChange"
            />
            <Button
              v-if="hasDateRange"
              variant="ghost"
              size="sm"
              class="mt-2 w-full"
              @click="clearDateRange"
            >
              Effacer
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        class="ml-auto gap-1.5"
        :disabled="!hasActiveFilters"
        @click="emit('reset-filters')"
      >
        <RotateCcw class="size-4" />
        Réinitialiser
      </Button>
    </div>
  </div>
</template>
