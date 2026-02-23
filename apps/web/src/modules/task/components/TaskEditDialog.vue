<script setup lang="ts">
import type { TaskResponse } from "@kresus/contract";

import { useEditTask } from "../composables/useEditTask";
import { useTaskFormDialog } from "../composables/useTaskFormDialog";
import TaskFormFields from "./TaskFormFields.vue";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const props = defineProps<{
  task: TaskResponse;
}>();

const open = defineModel<boolean>("open", { required: true });

const executionDateIso = props.task.executionDate
  ? new Date(props.task.executionDate).toISOString()
  : undefined;

const { mutate, isPending, error } = useEditTask();

const { handleSubmit, values, selectedDate, errorMessage, isSubmitDisabled, onDateSelect } =
  useTaskFormDialog({
    initialValues: {
      title: props.task.title,
      content: props.task.content,
      priority: props.task.priority,
      executionDate: executionDateIso,
      completed: !!props.task.completedAt,
    },
    error,
    isPending,
  });

const close = () => {
  open.value = false;
};

const onSubmit = handleSubmit((values) => {
  mutate({ id: props.task.id, ...values }, { onSuccess: () => close() });
});
</script>

<template>
  <Dialog v-model:open="open" @update:open="(v) => { if (!v) close() }">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ $t("taskDialog.editTitle") }}</DialogTitle>
        <DialogDescription>{{ $t("taskDialog.editDescription") }}</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <!-- @vue-ignore Volar false positive: #private fields in @internationalized/date break structural check on DateValue union -->
        <TaskFormFields :values="values" :selected-date="selectedDate" @date-select="onDateSelect" />
        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        <DialogFooter>
          <Button type="button" variant="outline" @click="close">
            {{ $t("common.cancel") }}
          </Button>
          <Button type="submit" :disabled="isSubmitDisabled">
            {{ isPending ? $t("taskDialog.editing") : $t("taskDialog.editAction") }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
