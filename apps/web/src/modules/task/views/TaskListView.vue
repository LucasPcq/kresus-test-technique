<script setup lang="ts">
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { Loader2 } from "lucide-vue-next";

import { useDeleteTask } from "../composables/useDeleteTask";
import { useToggleTaskComplete } from "../composables/useToggleTaskComplete";
import { useBatchDeleteTasks } from "../composables/useBatchDeleteTasks";
import { useTaskFilters } from "../composables/useTaskFilters";
import { useTaskList } from "../composables/useTaskList";
import { useTaskSelection } from "../composables/useTaskSelection";

import TaskCard from "../components/TaskCard.vue";
import TaskCardSkeleton from "../components/TaskCardSkeleton.vue";
import TaskCreateDialog from "../components/TaskCreateDialog.vue";
import TaskEmptyState from "../components/TaskEmptyState.vue";
import TaskErrorState from "../components/TaskErrorState.vue";
import TaskFilters from "../components/TaskFilters.vue";
import TaskPagination from "../components/TaskPagination.vue";
import TaskListHeader from "../components/TaskListHeader.vue";
import TaskSelectionBar from "../components/TaskSelectionBar.vue";

import { Button } from "@/components/ui/button";

const TASK_GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start";

const isCreateDialogOpen = ref(false);

const {
  filters,
  paginationMode,
  queryParams,
  hasActiveFilters,
  activeFilters,
  setPage,
  setPageSize,
  setSort,
  setFilter,
  removeFilter,
  setTitleSearch,
  setPaginationMode,
  resetFilters,
} = useTaskFilters();

const {
  tasks,
  total,
  totalPages,
  isPending,
  isFetching,
  isError,
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

const { mutate: batchDeleteMutation, isPending: isBatchDeletePending } = useBatchDeleteTasks();

const { mutate: toggleCompleteMutation } = useToggleTaskComplete();

const {
  selectionMode,
  selectedIds,
  selectedCount,
  toggleSelectionMode,
  toggleSelect,
  resetSelection,
} = useTaskSelection();

const onBatchDelete = () => {
  batchDeleteMutation([...selectedIds], { onSuccess: resetSelection });
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
      :has-active-filters="hasActiveFilters"
      :active-filters="activeFilters"
      @update:title-search="setTitleSearch"
      @add-filter="setFilter"
      @remove-filter="removeFilter"
      @reset-filters="resetFilters"
    />

    <div class="min-h-0 flex-1 overflow-y-auto pb-2">
      <div v-if="isPending" :class="TASK_GRID_CLASS">
        <TaskCardSkeleton v-for="i in filters.pageSize" :key="i" />
      </div>

      <TaskErrorState
        v-else-if="isError"
        class="h-full"
        :has-filters="hasActiveFilters"
        @reset-filters="resetFilters"
      />

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
            @toggle-complete="(id, completed) => toggleCompleteMutation({ id, completed })"
          />
        </div>

        <div v-if="isInfinite" ref="sentinelRef" class="flex justify-center py-4">
          <Button
            v-if="isFetchingNextPage"
            variant="ghost"
            disabled
          >
            <Loader2 class="mr-2 size-4 animate-spin" />
            {{ $t("common.loading") }}
          </Button>
        </div>
      </template>
    </div>

    <div
      v-if="!isPending && tasks.length > 0"
      class="shrink-0 -mx-4 -mb-4 md:-mx-8 md:-mb-8 border-t bg-background px-4 md:px-8 py-3"
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

    <TaskSelectionBar
      v-if="selectionMode && selectedCount > 0"
      :selected-count="selectedCount"
      :is-deleting="isBatchDeletePending"
      @delete="onBatchDelete"
    />

    <TaskCreateDialog v-if="isCreateDialogOpen" v-model:open="isCreateDialogOpen" />
  </div>
</template>
