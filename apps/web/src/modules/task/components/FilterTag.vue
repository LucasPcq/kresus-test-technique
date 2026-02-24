<script setup lang="ts">
import { computed, ref } from "vue";

import { X } from "lucide-vue-next";

import type { ActiveFilter } from "../task.filter-config";
import { formatFilterLabel, getFieldConfig, isPriorityOperator } from "../task.filter-config";

import FilterValuePicker from "./FilterValuePicker.vue";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const props = defineProps<{
  filter: ActiveFilter;
}>();

const emit = defineEmits<{
  remove: [];
  edit: [filter: ActiveFilter];
}>();

const fieldConfig = computed(() => getFieldConfig(props.filter.field));

const showsCalendar = computed(() => fieldConfig.value?.valueType === "calendar");
const popoverWidth = computed(() => (showsCalendar.value ? "w-auto" : "w-56"));

const isOpen = ref(false);

const onValueSelect = (filter: ActiveFilter) => {
  emit("edit", filter);
  isOpen.value = false;
};

const onOperatorChange = (op: string) => {
  if (props.filter.field !== "priority" || !isPriorityOperator(op)) return;
  emit("edit", { ...props.filter, operator: op });
};
</script>

<template>
  <Popover v-model:open="isOpen">
    <Badge variant="secondary" class="gap-1.5 rounded-md py-1 pl-0 pr-1">
      <PopoverTrigger as-child>
        <button
          class="cursor-pointer rounded-md px-2.5 py-0.5 text-xs hover:bg-muted-foreground/20"
        >
          {{ formatFilterLabel(filter) }}
        </button>
      </PopoverTrigger>
      <button
        class="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
        @click="$emit('remove')"
      >
        <X class="size-3" />
      </button>
    </Badge>

    <PopoverContent :class="[popoverWidth, 'p-0']" align="start">
      <FilterValuePicker
        v-if="isOpen && fieldConfig"
        :config="fieldConfig"
        :initial-operator="filter.operator"
        :current-filter="filter"
        @select="onValueSelect"
        @update:operator="onOperatorChange"
      />
    </PopoverContent>
  </Popover>
</template>
