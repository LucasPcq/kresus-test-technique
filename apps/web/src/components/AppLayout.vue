<script setup lang="ts">
import { RouterView } from "vue-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import AppSidebar from "./AppSidebar.vue";
</script>

<template>
  <SidebarProvider :open="false" class="h-svh overflow-hidden">
    <AppSidebar />
    <SidebarInset>
      <div class="flex flex-1 flex-col overflow-hidden p-8">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
