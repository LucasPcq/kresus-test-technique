<script setup lang="ts">
import { ref } from "vue";

import { EllipsisVertical, Pencil, Trash2 } from "lucide-vue-next";

import { Button, buttonVariants } from "@/components/ui/button";
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

defineProps<{
  isDeleting?: boolean;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();

const isAlertOpen = ref(false);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-7"
        :aria-label="$t('task.actions')"
      >
        <EllipsisVertical class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="emit('edit')">
        <Pencil class="size-4" />
        {{ $t("task.edit") }}
      </DropdownMenuItem>
      <DropdownMenuItem class="text-destructive" @click="isAlertOpen = true">
        <Trash2 class="size-4" />
        {{ $t("common.delete") }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <AlertDialog v-if="isAlertOpen" v-model:open="isAlertOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t("taskDelete.title") }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t("taskDelete.description") }}
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
