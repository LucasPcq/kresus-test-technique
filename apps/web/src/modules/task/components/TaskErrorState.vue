<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";

import { Button } from "@/components/ui/button";

defineProps<{ hasFilters: boolean }>();
const emit = defineEmits<{ "reset-filters": [] }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 text-center">
    <AlertTriangle class="size-12 text-destructive" />
    <div>
      <p class="text-lg font-medium">{{ $t("error.loadingTitle") }}</p>
      <p class="text-sm text-muted-foreground">
        {{ $t("error.loadingDescription") }}
      </p>
    </div>
    <Button v-if="hasFilters" variant="outline" @click="emit('reset-filters')">
      {{ $t("common.resetFilters") }}
    </Button>
  </div>
</template>
