<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";

import { Button } from "@/components/ui/button";

defineProps<{ hasFilters: boolean }>();
const emit = defineEmits<{ "reset-filters": []; retry: [] }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 text-center">
    <AlertTriangle class="size-12 text-destructive" />
    <div>
      <p class="text-lg font-medium">Erreur de chargement</p>
      <p class="text-sm text-muted-foreground">
        Impossible de récupérer les tâches. Vérifiez vos filtres ou réessayez.
      </p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" @click="emit('retry')">
        Réessayer
      </Button>
      <Button v-if="hasFilters" variant="outline" @click="emit('reset-filters')">
        Réinitialiser les filtres
      </Button>
    </div>
  </div>
</template>
