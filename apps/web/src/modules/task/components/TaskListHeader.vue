<script setup lang="ts">
import type { TaskQueryDto } from "@kresus/contract";

import type { AcceptableValue } from "reka-ui";
import { Plus } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
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
  create: [];
}>();

const onSortChange = (val: AcceptableValue | AcceptableValue[]) => {
  if (typeof val !== "string") return;
  emit("update:sort", val);
};
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-3xl font-bold tracking-tight">Mes tâches</h2>

    <div class="flex items-center gap-2">
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

      <Button @click="emit('create')">
        <Plus class="size-4" />
        Créer une tâche
      </Button>
    </div>
  </div>
</template>
