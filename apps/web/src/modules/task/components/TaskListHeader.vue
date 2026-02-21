<script setup lang="ts">
import type { TaskQueryDto } from "@kresus/contract";

import type { AcceptableValue } from "reka-ui";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SORT_OPTIONS } from "../task.constants";

defineProps<{
  sort: NonNullable<TaskQueryDto["sort"]>;
}>();

const emit = defineEmits<{
  "update:sort": [value: NonNullable<TaskQueryDto["sort"]>];
}>();

const onSortChange = (val: AcceptableValue | AcceptableValue[]) => {
  if (typeof val !== "string") return;
  emit("update:sort", val);
};
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-3xl font-bold tracking-tight">Mes tâches</h2>

    <Select :model-value="sort" @update:model-value="onSortChange">
      <SelectTrigger class="w-52">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="opt in SORT_OPTIONS"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
