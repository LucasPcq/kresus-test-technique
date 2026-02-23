<script setup lang="ts">
import { computed, ref } from "vue";
import { CalendarDays, CheckCircle2, Circle } from "lucide-vue-next";

import type { TaskResponse } from "@kresus/contract";

import { formatDateShort } from "@/lib/date";

import TaskCardActions from "./TaskCardActions.vue";
import TaskEditDialog from "./TaskEditDialog.vue";

import { PRIORITY_CONFIG } from "../task.constants";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const props = defineProps<{
  task: TaskResponse;
  isDeleting?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  delete: [id: string];
  "toggle-select": [id: string];
  "toggle-complete": [id: string, completed: boolean];
}>();

const isEditOpen = ref(false);

const priorityConfig = computed(() => PRIORITY_CONFIG[props.task.priority]);

const isCompleted = computed(() => !!props.task.completedAt);

const formattedDate = computed(() => {
  if (!props.task.executionDate) return null;
  return formatDateShort(new Date(props.task.executionDate));
});
</script>

<template>
  <Card
    :class="[
      'group relative flex flex-col transition-colors',
      isCompleted && 'opacity-60',
      selectionMode && 'cursor-pointer',
    ]"
    @click="selectionMode && emit('toggle-select', task.id)"
  >
    <div v-if="!selectionMode" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <TaskCardActions :is-deleting="isDeleting" @edit="isEditOpen = true" @delete="emit('delete', task.id)" />
    </div>

    <CardHeader class="flex-row items-start justify-between gap-2 space-y-0">
      <div class="flex items-center gap-2 min-w-0">
        <Checkbox
          v-if="selectionMode"
          :model-value="selected"
          class="shrink-0"
          @click.stop
          @update:model-value="emit('toggle-select', task.id)"
        />
        <button
          v-else
          type="button"
          class="shrink-0 cursor-pointer"
          :aria-label="isCompleted ? 'Marquer comme non complétée' : 'Marquer comme complétée'"
          @click.stop="emit('toggle-complete', task.id, !isCompleted)"
        >
          <component
            :is="isCompleted ? CheckCircle2 : Circle"
            :class="[
              'size-5 transition-colors',
              isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-green-400',
            ]"
          />
        </button>
        <CardTitle class="text-base truncate">{{ task.title }}</CardTitle>
      </div>
      <Badge :variant="priorityConfig.variant">{{ priorityConfig.label }}</Badge>
    </CardHeader>
    <CardContent>
      <p class="text-sm text-muted-foreground">{{ task.content }}</p>
    </CardContent>
    <CardFooter v-if="formattedDate" class="mt-auto text-xs text-muted-foreground gap-1">
      <CalendarDays class="size-3.5" />
      {{ formattedDate }}
    </CardFooter>
  </Card>

  <TaskEditDialog v-if="isEditOpen" :task="task" v-model:open="isEditOpen" />
</template>
