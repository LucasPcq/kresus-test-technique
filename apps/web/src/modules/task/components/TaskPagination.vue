<script setup lang="ts">
import { computed } from "vue";

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

import { pluralize } from "@/lib/utils";

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

const props = defineProps<{
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

const isClassicMode = computed(() => props.paginationMode === PAGINATION_MODE.CLASSIC);

const isPaginationMode = (value: unknown): value is PaginationMode =>
  typeof value === "string" && (PAGINATION_MODES as readonly string[]).includes(value);

const onPaginationModeChange = (value: AcceptableValue | AcceptableValue[]) => {
  if (!isPaginationMode(value)) return;
  emit("update:paginationMode", value);
};

const onPageSizeChange = (val: string) => {
  const size = Number(val);
  if (!(PAGE_SIZES as readonly number[]).includes(size)) return;
  emit("update:pageSize", size);
};
</script>

<template>
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground shrink-0">
        {{ total }} {{ pluralize(total, 'tâche') }}
      </p>

      <ToggleGroup
        type="single"
        :model-value="paginationMode"
        @update:model-value="onPaginationModeChange"
        variant="outline"
        size="sm"
        class="md:hidden"
      >
        <ToggleGroupItem :value="PAGINATION_MODE.CLASSIC">
          <ArrowLeftRight class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem :value="PAGINATION_MODE.INFINITE">
          <InfinityIcon class="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <Pagination
      v-if="isClassicMode"
      v-slot="{ page: currentPage }"
      :page="page"
      :items-per-page="pageSize"
      :total="total"
      :sibling-count="1"
      @update:page="emit('update:page', $event)"
    >
      <PaginationContent class="justify-center">
        <PaginationFirst>
          <ChevronFirst class="size-4" />
          <span class="hidden lg:block">Début</span>
        </PaginationFirst>
        <PaginationPrevious>
          <ChevronLeft class="size-4" />
          <span class="hidden lg:block">Précédent</span>
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
          <span class="hidden lg:block">Suivant</span>
          <ChevronRight class="size-4" />
        </PaginationNext>
        <PaginationLast>
          <span class="hidden lg:block">Fin</span>
          <ChevronLast class="size-4" />
        </PaginationLast>
      </PaginationContent>
    </Pagination>

    <div class="hidden md:flex items-center gap-3">
      <Select v-if="isClassicMode" :model-value="String(pageSize)" @update:model-value="onPageSizeChange">
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
