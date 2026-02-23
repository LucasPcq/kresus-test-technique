<script setup lang="ts">
import { RouterView } from "vue-router";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import AppSidebar from "./AppSidebar.vue";
</script>

<template>
  <SidebarProvider :open="false" class="h-svh overflow-hidden">
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-12 shrink-0 items-center border-b px-4 md:hidden">
        <SidebarTrigger />
      </header>
      <div class="flex flex-1 flex-col overflow-hidden p-4 md:p-8">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
