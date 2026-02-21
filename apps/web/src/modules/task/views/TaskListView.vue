<script setup lang="ts">
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { Loader2 } from "lucide-vue-next";

import { useTaskFilters } from "../composables/useTaskFilters";
import { useTaskList } from "../composables/useTaskList";

import TaskCard from "../components/TaskCard.vue";
import TaskCardSkeleton from "../components/TaskCardSkeleton.vue";
import TaskEmptyState from "../components/TaskEmptyState.vue";
import TaskFilters from "../components/TaskFilters.vue";
import TaskPagination from "../components/TaskPagination.vue";
import TaskListHeader from "../components/TaskListHeader.vue";

import { Button } from "@/components/ui/button";

const TASK_GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start";

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
      @update:sort="setSort"
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

      <TaskEmptyState v-else-if="tasks.length === 0" class="h-full" :has-filters="hasActiveFilters" @reset-filters="resetFilters" />

      <template v-else>
        <div
          :class="[
            TASK_GRID_CLASS,
            'transition-opacity',
            isFetching && !isPending && 'opacity-50',
          ]"
        >
          <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
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
  </div>
</template>
