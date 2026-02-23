<script setup lang="ts">
import { ref } from "vue";

import { Trash2 } from "lucide-vue-next";

import { Button, buttonVariants } from "@/components/ui/button";
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

defineProps<{
  selectedCount: number;
  isDeleting?: boolean;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const isAlertOpen = ref(false);
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg"
    >
      <span class="text-sm font-medium">
        {{ $t("taskDelete.selected", { count: selectedCount }, selectedCount) }}
      </span>
      <Button variant="destructive" size="sm" @click="isAlertOpen = true">
        <Trash2 class="size-4" />
        {{ $t("common.delete") }}
      </Button>
    </div>
  </Transition>

  <AlertDialog v-if="isAlertOpen" v-model:open="isAlertOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t("taskDelete.batchTitle") }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t("taskDelete.batchDescription", { count: selectedCount }, selectedCount) }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ $t("common.cancel") }}</AlertDialogCancel>
        <AlertDialogAction
          :class="buttonVariants({ variant: 'destructive' })"
          :disabled="isDeleting"
          @click="emit('delete')"
        >
          {{ isDeleting ? $t("common.deleting") : $t("common.delete") }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
