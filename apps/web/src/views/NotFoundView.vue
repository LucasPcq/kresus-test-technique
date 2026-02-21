<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    <p class="text-8xl font-bold text-muted-foreground/30">404</p>
    <h1 class="text-2xl font-bold">Page introuvable</h1>
    <p class="text-muted-foreground">La page que vous cherchez n'existe pas.</p>
    <Button as-child>
      <RouterLink to="/">Retour à l'accueil</RouterLink>
    </Button>
  </div>
</template>
