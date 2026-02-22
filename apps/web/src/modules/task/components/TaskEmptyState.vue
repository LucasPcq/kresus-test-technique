<script setup lang="ts">
import { ClipboardList, Plus, SearchX } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

defineProps<{ hasFilters: boolean }>();
const emit = defineEmits<{ "reset-filters": []; create: [] }>();
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
    <Button v-else @click="emit('create')">
      <Plus class="size-4" />
      Créer une tâche
    </Button>
  </div>
</template>
