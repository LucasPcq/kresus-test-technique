<script setup lang="ts">
import { ClipboardList, SearchX } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

defineProps<{ hasFilters: boolean }>();
const emit = defineEmits<{ "reset-filters": [] }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 text-center">
    <component
      :is="hasFilters ? SearchX : ClipboardList"
      class="size-12 text-muted-foreground"
    />
    <div>
      <p class="text-lg font-medium">
        {{ hasFilters ? "Aucun résultat" : "Aucune tâche" }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{
          hasFilters
            ? "Aucune tâche ne correspond à vos filtres."
            : "Vous n'avez pas encore de tâches."
        }}
      </p>
    </div>
    <Button v-if="hasFilters" variant="outline" @click="emit('reset-filters')">
      Réinitialiser les filtres
    </Button>
  </div>
</template>
