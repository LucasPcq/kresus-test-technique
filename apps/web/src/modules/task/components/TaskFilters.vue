<script setup lang="ts">
import { ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";

import { RotateCcw, Search } from "lucide-vue-next";

import type { ActiveFilter, FilterField } from "../task.filter-config";
import { SEARCH_DEBOUNCE_MS } from "../task.constants";

import FilterPopover from "./FilterPopover.vue";
import FilterTag from "./FilterTag.vue";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  titleSearch: string | undefined;
  hasActiveFilters: boolean;
  activeFilters: ReadonlyArray<ActiveFilter>;
}>();

const emit = defineEmits<{
  "update:titleSearch": [value: string | undefined];
  "add-filter": [filter: ActiveFilter];
  "remove-filter": [field: FilterField];
  "reset-filters": [];
}>();

const localTitle = ref(props.titleSearch ?? "");

watch(
  () => props.titleSearch,
  (v) => {
    localTitle.value = v ?? "";
  },
);

watchDebounced(localTitle, (v) => emit("update:titleSearch", v || undefined), {
  debounce: SEARCH_DEBOUNCE_MS,
});
</script>

<template>
  <div class="space-y-3">
    <div class="relative">
      <Search class="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        v-model="localTitle"
        placeholder="Rechercher une tâche…"
        class="pl-9"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <FilterPopover @select="(f) => emit('add-filter', f)" />

      <FilterTag
        v-for="filter in activeFilters"
        :key="filter.field"
        :filter="filter"
        @remove="emit('remove-filter', filter.field)"
        @edit="(f) => emit('add-filter', f)"
      />

      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        class="ml-auto gap-1.5"
        @click="emit('reset-filters')"
      >
        <RotateCcw class="size-4" />
        Réinitialiser
      </Button>
    </div>
  </div>
</template>
