<script setup lang="ts">
import { CheckSquare, Plus } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SortValue } from "@kresus/contract";

import { SORT_OPTIONS } from "../task.constants";

defineProps<{
  sort: SortValue;
  selectionMode: boolean;
}>();

const emit = defineEmits<{
  "update:sort": [value: SortValue];
  create: [];
  "toggle-selection-mode": [];
}>();

const onSortChange = (val: SortValue) => {
  emit("update:sort", val);
};
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h2 class="text-3xl font-bold tracking-tight">{{ $t("task.myTasks") }}</h2>

    <div class="flex items-center gap-2">
      <Select :model-value="sort" @update:model-value="onSortChange">
        <SelectTrigger class="w-40 sm:w-52">
          <SelectValue :placeholder="$t('task.sortBy')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="opt in SORT_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ $t(opt.labelKey) }} {{ opt.direction }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        :variant="selectionMode ? 'secondary' : 'outline'"
        size="icon"
        class="sm:hidden"
        @click="emit('toggle-selection-mode')"
      >
        <CheckSquare class="size-4" />
      </Button>
      <Button
        :variant="selectionMode ? 'secondary' : 'outline'"
        class="hidden sm:inline-flex"
        @click="emit('toggle-selection-mode')"
      >
        <CheckSquare class="size-4" />
        {{ $t("task.select") }}
      </Button>

      <Button size="icon" class="sm:hidden" @click="emit('create')">
        <Plus class="size-4" />
      </Button>
      <Button class="hidden sm:inline-flex" @click="emit('create')">
        <Plus class="size-4" />
        {{ $t("task.createTask") }}
      </Button>
    </div>
  </div>
</template>
