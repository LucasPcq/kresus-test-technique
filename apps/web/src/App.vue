<script setup lang="ts">
import "vue-sonner/style.css";
import { computed } from "vue";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/composables/useTheme";

const { mode } = useTheme();
const toasterTheme = computed(() => (mode.value === "auto" ? "system" : mode.value));
</script>

<template>
  <RouterView />
  <Toaster position="bottom-right" :rich-colors="true" :theme="toasterTheme" />
</template>
