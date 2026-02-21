<script setup lang="ts">
import { RouterView } from "vue-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar.vue";
</script>

<template>
  <SidebarProvider class="h-svh overflow-hidden">
    <AppSidebar />
    <SidebarInset>
      <div class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
