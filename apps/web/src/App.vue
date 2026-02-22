<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <RouterView />
  <Toaster position="bottom-right" :rich-colors="true" />
</template>
