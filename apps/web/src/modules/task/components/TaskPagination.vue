<script setup lang="ts">
import { PAGE_SIZES } from "@kresus/contract";

import type { AcceptableValue } from "reka-ui";

import {
  ArrowLeftRight,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Infinity as InfinityIcon,
} from "lucide-vue-next";

import { type PaginationMode, PAGINATION_MODE, PAGINATION_MODES } from "../task.constants";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

defineProps<{
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  paginationMode: PaginationMode;
}>();

const emit = defineEmits<{
  "update:page": [value: number];
  "update:pageSize": [value: number];
  "update:paginationMode": [value: PaginationMode];
}>();

const isPaginationMode = (value: string): value is PaginationMode =>
  (PAGINATION_MODES as readonly string[]).includes(value);

const onPaginationModeChange = (value: AcceptableValue | AcceptableValue[]) => {
  if (typeof value !== "string" || !isPaginationMode(value)) return;
  emit("update:paginationMode", value);
};

const onPageSizeChange = (val: AcceptableValue | AcceptableValue[]) => {
  if (typeof val !== "string") return;
  const size = Number(val);
  if (!(PAGE_SIZES as readonly number[]).includes(size)) return;
  emit("update:pageSize", size);
};
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <p class="text-sm text-muted-foreground shrink-0">
      {{ total }} tâche{{ total > 1 ? "s" : "" }}
    </p>

    <Pagination
      v-if="paginationMode === PAGINATION_MODE.CLASSIC"
      v-slot="{ page: currentPage }"
      :page="page"
      :items-per-page="pageSize"
      :total="total"
      :sibling-count="1"
      @update:page="emit('update:page', $event)"
    >
      <PaginationContent>
        <PaginationFirst>
          <ChevronFirst class="size-4" />
          <span class="hidden sm:block">Début</span>
        </PaginationFirst>
        <PaginationPrevious>
          <ChevronLeft class="size-4" />
          <span class="hidden sm:block">Précédent</span>
        </PaginationPrevious>

        <template v-for="item in totalPages" :key="item">
          <PaginationItem
            v-if="Math.abs(item - page) <= 1 || item === 1 || item === totalPages"
            :value="item"
            :is-active="item === currentPage"
          />
          <PaginationEllipsis
            v-else-if="item === 2 || item === totalPages - 1"
          />
        </template>

        <PaginationNext>
          <span class="hidden sm:block">Suivant</span>
          <ChevronRight class="size-4" />
        </PaginationNext>
        <PaginationLast>
          <span class="hidden sm:block">Fin</span>
          <ChevronLast class="size-4" />
        </PaginationLast>
      </PaginationContent>
    </Pagination>

    <div class="flex items-center gap-3">
      <Select v-if="paginationMode === PAGINATION_MODE.CLASSIC" :model-value="String(pageSize)" @update:model-value="onPageSizeChange">
        <SelectTrigger class="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in PAGE_SIZES" :key="size" :value="String(size)">
            {{ size }} / page
          </SelectItem>
        </SelectContent>
      </Select>

      <ToggleGroup
        type="single"
        :model-value="paginationMode"
        @update:model-value="onPaginationModeChange"
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem :value="PAGINATION_MODE.CLASSIC">
          <ArrowLeftRight class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem :value="PAGINATION_MODE.INFINITE">
          <InfinityIcon class="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  </div>
</template>
