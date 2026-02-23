<script setup lang="ts">
import { RouterLink } from "vue-router";
import { CheckSquare } from "lucide-vue-next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import NavUser from "./NavUser.vue";
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child tooltip="Kresus Tasks">
            <RouterLink to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <CheckSquare class="size-4" />
              </div>
              <span class="font-semibold">Kresus Tasks</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent />

    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
</template>
