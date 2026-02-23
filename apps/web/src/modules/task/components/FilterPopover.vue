<script setup lang="ts">
import { computed, ref } from "vue";
import type { AcceptableValue, ListboxItemSelectEvent } from "reka-ui";

import { Plus, ChevronLeft } from "lucide-vue-next";

import type { ActiveFilter, FilterFieldConfig } from "../task.filter-config";
import { FILTER_FIELD_CONFIGS } from "../task.filter-config";

import FilterValuePicker from "./FilterValuePicker.vue";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

const emit = defineEmits<{
  select: [filter: ActiveFilter];
}>();

type Step = "field" | "value";

const isOpen = ref(false);
const step = ref<Step>("field");
const selectedField = ref<FilterFieldConfig | null>(null);

const reset = () => {
  step.value = "field";
  selectedField.value = null;
};

const close = () => {
  isOpen.value = false;
  reset();
};

const onOpenChange = (open: boolean) => {
  isOpen.value = open;
  if (!open) reset();
};

const showsCalendar = computed(
  () => step.value === "value" && selectedField.value?.valueType === "calendar",
);

const popoverWidth = computed(() => (showsCalendar.value ? "w-auto" : "w-56"));

const onSelectField = (config: FilterFieldConfig, ev: ListboxItemSelectEvent<AcceptableValue>) => {
  ev.preventDefault();
  selectedField.value = config;
  step.value = "value";
};

const onValueSelect = (filter: ActiveFilter) => {
  emit("select", filter);
  close();
};
</script>

<template>
  <Popover :open="isOpen" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="gap-1.5 border-dashed">
        <Plus class="size-4" />
        {{ $t("filter.addFilter") }}
      </Button>
    </PopoverTrigger>
    <PopoverContent :class="[popoverWidth, 'p-0']" align="start">
      <Command v-if="step === 'field'">
        <CommandList>
          <CommandGroup :heading="$t('filter.filterBy')">
            <CommandItem
              v-for="config in FILTER_FIELD_CONFIGS"
              :key="config.field"
              :value="config.field"
              @select="(ev: ListboxItemSelectEvent<AcceptableValue>) => onSelectField(config, ev)"
            >
              {{ $t(config.labelKey) }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <FilterValuePicker
        v-else-if="step === 'value' && selectedField"
        :config="selectedField"
        :initial-operator="selectedField.defaultOperator"
        @select="onValueSelect"
      >
        <template #header-prefix>
          <button class="rounded p-0.5 hover:bg-muted" @click="reset">
            <ChevronLeft class="size-4" />
          </button>
        </template>
      </FilterValuePicker>
    </PopoverContent>
  </Popover>
</template>
