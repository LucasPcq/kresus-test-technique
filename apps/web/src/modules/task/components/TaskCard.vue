<script setup lang="ts">
import { computed, ref } from "vue";
import { CalendarDays, CheckCircle2, Circle, EllipsisVertical, Trash2 } from "lucide-vue-next";

import { Checkbox } from "@/components/ui/checkbox";

import type { TaskResponse } from "@kresus/contract";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateShort } from "@/lib/date";

import { PRIORITY_CONFIG } from "../task.constants";

const props = defineProps<{
  task: TaskResponse;
  isDeleting?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  delete: [id: string];
  "toggle-select": [id: string];
}>();

const isAlertOpen = ref(false);

const priorityConfig = computed(() => PRIORITY_CONFIG[props.task.priority]);

const isCompleted = computed(() => !!props.task.completedAt);

const formattedDate = computed(() => {
  if (!props.task.executionDate) return null;
  return formatDateShort(new Date(props.task.executionDate));
});

const onConfirmDelete = () => {
  emit("delete", props.task.id);
};
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
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="size-7"
            aria-label="Actions"
          >
            <EllipsisVertical class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="text-destructive" @click="isAlertOpen = true">
            <Trash2 class="size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        <component
          v-else
          :is="isCompleted ? CheckCircle2 : Circle"
          :class="[
            'size-5 shrink-0',
            isCompleted ? 'text-green-500' : 'text-muted-foreground',
          ]"
        />
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

  <AlertDialog v-model:open="isAlertOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer la tâche</AlertDialogTitle>
        <AlertDialogDescription>
          Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction
          :class="buttonVariants({ variant: 'destructive' })"
          :disabled="isDeleting"
          @click="onConfirmDelete"
        >
          {{ isDeleting ? "Suppression…" : "Supprimer" }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
