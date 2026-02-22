<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { Loader2, Trash2 } from "lucide-vue-next";

import { useBatchDeleteTasks } from "../composables/useBatchDeleteTasks";
import { useDeleteTask } from "../composables/useDeleteTask";
import { useTaskFilters } from "../composables/useTaskFilters";
import { useTaskList } from "../composables/useTaskList";

import TaskCard from "../components/TaskCard.vue";
import TaskCardSkeleton from "../components/TaskCardSkeleton.vue";
import TaskCreateDialog from "../components/TaskCreateDialog.vue";
import TaskEmptyState from "../components/TaskEmptyState.vue";
import TaskFilters from "../components/TaskFilters.vue";
import TaskPagination from "../components/TaskPagination.vue";
import TaskListHeader from "../components/TaskListHeader.vue";

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

const TASK_GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start";

const isCreateDialogOpen = ref(false);

const {
  filters,
  paginationMode,
  queryParams,
  hasActiveFilters,
  setPage,
  setPageSize,
  setSort,
  setCompleted,
  setPriority,
  setTitleSearch,
  setDateRange,
  setPaginationMode,
  resetFilters,
} = useTaskFilters();

const {
  tasks,
  total,
  totalPages,
  isPending,
  isFetching,
  isInfinite,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
} = useTaskList({ queryParams, paginationMode });

const {
  mutate: deleteMutation,
  isPending: isDeletePending,
  variables: deleteVariables,
} = useDeleteTask();

const {
  mutate: batchDeleteMutation,
  isPending: isBatchDeletePending,
} = useBatchDeleteTasks();

const selectionMode = ref(false);
const selectedIds = reactive(new Set<string>());
const isBatchAlertOpen = ref(false);

const selectedCount = computed(() => selectedIds.size);

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value;
  selectedIds.clear();
};

const toggleSelect = (id: string) => {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
};

const onConfirmBatchDelete = () => {
  batchDeleteMutation([...selectedIds], {
    onSuccess: () => {
      selectedIds.clear();
      selectionMode.value = false;
    },
  });
};

const sentinelRef = ref<HTMLElement | null>(null);

useIntersectionObserver(sentinelRef, ([entry]) => {
  if (entry?.isIntersecting && isInfinite.value && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
});
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-6">
    <TaskListHeader
      :sort="filters.sort"
      :selection-mode="selectionMode"
      @update:sort="setSort"
      @create="isCreateDialogOpen = true"
      @toggle-selection-mode="toggleSelectionMode"
    />

    <TaskFilters
      :title-search="filters.title"
      :completed="filters.completed"
      :priority="filters.priority"
      :date-from="filters.dateFrom"
      :date-to="filters.dateTo"
      :has-active-filters="hasActiveFilters"
      @update:title-search="setTitleSearch"
      @update:completed="setCompleted"
      @update:priority="setPriority"
      @update:date-range="setDateRange"
      @reset-filters="resetFilters"
    />

    <div class="min-h-0 flex-1 overflow-y-auto pb-2">
      <div v-if="isPending" :class="TASK_GRID_CLASS">
        <TaskCardSkeleton v-for="i in filters.pageSize" :key="i" />
      </div>

      <TaskEmptyState
        v-else-if="tasks.length === 0"
        class="h-full"
        :has-filters="hasActiveFilters"
        @reset-filters="resetFilters"
        @create="isCreateDialogOpen = true"
      />

      <template v-else>
        <div
          :class="[
            TASK_GRID_CLASS,
            'transition-opacity',
            isFetching && !isPending && 'opacity-50',
          ]"
        >
          <TaskCard
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :is-deleting="isDeletePending && deleteVariables === task.id"
            :selection-mode="selectionMode"
            :selected="selectedIds.has(task.id)"
            @delete="deleteMutation"
            @toggle-select="toggleSelect"
          />
        </div>

        <div v-if="isInfinite" ref="sentinelRef" class="flex justify-center py-4">
          <Button
            v-if="isFetchingNextPage"
            variant="ghost"
            disabled
          >
            <Loader2 class="mr-2 size-4 animate-spin" />
            Chargement…
          </Button>
        </div>
      </template>
    </div>

    <div
      v-if="!isPending && tasks.length > 0"
      class="shrink-0 -mx-8 -mb-8 border-t bg-background px-8 py-3"
    >
      <TaskPagination
        :page="filters.page"
        :total-pages="totalPages"
        :page-size="filters.pageSize"
        :total="total"
        :pagination-mode="filters.mode"
        @update:page="setPage"
        @update:page-size="setPageSize"
        @update:pagination-mode="setPaginationMode"
      />
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="selectionMode && selectedCount > 0"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg"
      >
        <span class="text-sm font-medium">
          {{ selectedCount }} tâche{{ selectedCount > 1 ? "s" : "" }} sélectionnée{{ selectedCount > 1 ? "s" : "" }}
        </span>
        <Button variant="destructive" size="sm" @click="isBatchAlertOpen = true">
          <Trash2 class="size-4" />
          Supprimer
        </Button>
      </div>
    </Transition>

    <AlertDialog v-model:open="isBatchAlertOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer les tâches</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer {{ selectedCount }} tâche{{ selectedCount > 1 ? "s" : "" }} ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            :class="buttonVariants({ variant: 'destructive' })"
            :disabled="isBatchDeletePending"
            @click="onConfirmBatchDelete"
          >
            {{ isBatchDeletePending ? "Suppression…" : "Supprimer" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <TaskCreateDialog v-model:open="isCreateDialogOpen" />
  </div>
</template>
