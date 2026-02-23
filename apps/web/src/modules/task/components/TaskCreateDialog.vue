<script setup lang="ts">
import { PRIORITY } from "@kresus/contract";

import { useCreateTask } from "../composables/useCreateTask";
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

const open = defineModel<boolean>("open", { required: true });

const { mutate, isPending, error } = useCreateTask();

const { handleSubmit, resetForm, values, selectedDate, errorMessage, isSubmitDisabled, onDateSelect } =
  useTaskFormDialog({
    initialValues: { title: "", content: "", priority: PRIORITY.MEDIUM, completed: false },
    error,
    isPending,
  });

const close = () => {
  resetForm();
  selectedDate.value = undefined;
  open.value = false;
};

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => close(),
  });
});
</script>

<template>
  <Dialog v-model:open="open" @update:open="(v) => { if (!v) close() }">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nouvelle tâche</DialogTitle>
        <DialogDescription>Remplissez les informations pour créer une nouvelle tâche.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <!-- @vue-ignore Volar false positive: #private fields in @internationalized/date break structural check on DateValue union -->
        <TaskFormFields :values="values" :selected-date="selectedDate" @date-select="onDateSelect" />
        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        <DialogFooter>
          <Button type="button" variant="outline" @click="close">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitDisabled">
            {{ isPending ? "Création…" : "Créer" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
