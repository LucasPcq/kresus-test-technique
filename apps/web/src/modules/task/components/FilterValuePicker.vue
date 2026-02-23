<script setup lang="ts">
import { computed, ref } from "vue";
import type { AcceptableValue, DateRange, DateValue, ListboxItemSelectEvent } from "reka-ui";

import type { Priority } from "@kresus/contract";
import { Check } from "lucide-vue-next";

import { parseIsoToCalendarDate } from "@/lib/date";

import type { ActiveFilter, FilterFieldConfig } from "../task.filter-config";

import { Calendar } from "@/components/ui/calendar";
import { RangeCalendar } from "@/components/ui/range-calendar";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

const props = defineProps<{
  config: FilterFieldConfig;
  initialOperator: string;
  currentFilter?: ActiveFilter;
}>();

const emit = defineEmits<{
  select: [filter: ActiveFilter];
  "update:operator": [operator: string];
}>();

const selectedOperator = ref(props.initialOperator);
const selectedDate = ref<DateValue>();
const calendarRange = ref<DateRange>({ start: undefined, end: undefined });

const hasMultipleOperators = computed(() => props.config.operators.length > 1);

if (props.currentFilter?.field === "executionDate") {
  const f = props.currentFilter;
  switch (f.operator) {
    case "between":
      calendarRange.value = {
        start: parseIsoToCalendarDate(f.value.from),
        end: parseIsoToCalendarDate(f.value.to),
      };
      break;
    case "gte":
      selectedDate.value = parseIsoToCalendarDate(f.value.from);
      break;
    case "lte":
      selectedDate.value = parseIsoToCalendarDate(f.value.to);
      break;
  }
}

const onOperatorChange = (value: AcceptableValue) => {
  const op = String(value);
  const previousOp = selectedOperator.value;
  selectedOperator.value = op;

  if (op === "between" && previousOp !== "between") {
    selectedDate.value = undefined;
  } else if (op !== "between" && previousOp === "between") {
    const source = op === "gte" ? calendarRange.value.start : calendarRange.value.end;
    selectedDate.value = source ? parseIsoToCalendarDate(source.toString()) : undefined;
    calendarRange.value = { start: undefined, end: undefined };
  }

  if (selectedDate.value && op !== "between") {
    onSingleDateSelect(selectedDate.value);
    return;
  }

  emit("update:operator", op);
};

const buildSelectFilter = (value: unknown): ActiveFilter | undefined => {
  const op = selectedOperator.value;
  switch (props.config.field) {
    case "completed":
      return { field: "completed", operator: "eq", value: value as boolean };
    case "priority":
      return { field: "priority", operator: op as "eq" | "neq", value: value as Priority };
  }
};

const onSelectValue = (value: unknown, ev: ListboxItemSelectEvent<AcceptableValue>) => {
  ev.preventDefault();
  const filter = buildSelectFilter(value);
  if (filter) emit("select", filter);
};

const onSingleDateSelect = (date: DateValue) => {
  const iso = date.toString();
  const op = selectedOperator.value;
  if (op === "gte") {
    emit("select", { field: "executionDate", operator: "gte", value: { from: iso } });
  } else if (op === "lte") {
    emit("select", { field: "executionDate", operator: "lte", value: { to: iso } });
  }
};

const onDateRangeChange = (range: DateRange) => {
  calendarRange.value = range;
  if (!range.start || !range.end) return;
  emit("select", {
    field: "executionDate",
    operator: "between",
    value: { from: range.start.toString(), to: range.end.toString() },
  });
};
</script>

<template>
  <div class="flex items-center gap-1 border-b px-2 py-1.5">
    <slot name="header-prefix" />
    <span class="text-xs font-medium text-muted-foreground">{{ $t(config.labelKey) }}</span>
    <NativeSelect
      v-if="hasMultipleOperators"
      :model-value="selectedOperator"
      class="h-7 border-none bg-transparent py-0 pl-2 pr-7 text-xs shadow-none"
      @update:model-value="onOperatorChange"
    >
      <NativeSelectOption
        v-for="op in config.operators"
        :key="op.value"
        :value="op.value"
      >
        {{ $t(op.labelKey) }}
      </NativeSelectOption>
    </NativeSelect>
  </div>

  <Command v-if="config.valueType === 'select'">
    <CommandList>
      <CommandGroup>
        <CommandItem
          v-for="val in config.values"
          :key="String(val.value)"
          :value="String(val.value)"
          class="flex items-center justify-between"
          @select="(ev: ListboxItemSelectEvent<AcceptableValue>) => onSelectValue(val.value, ev)"
        >
          {{ $t(val.labelKey) }}
          <Check v-if="currentFilter && val.value === currentFilter.value" class="size-4" />
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>

  <div v-else-if="config.valueType === 'calendar' && selectedOperator !== 'between'" class="p-0">
    <!-- @vue-ignore — CalendarDate has #private fields that Volar cannot structurally match against DateValue -->
    <Calendar :model-value="selectedDate" @update:model-value="onSingleDateSelect" />
  </div>

  <div v-else-if="config.valueType === 'calendar' && selectedOperator === 'between'" class="p-0">
    <!-- @vue-ignore — CalendarDate has #private fields that Volar cannot structurally match against DateValue -->
    <RangeCalendar
      :model-value="calendarRange"
      @update:model-value="onDateRangeChange"
    />
  </div>
</template>
