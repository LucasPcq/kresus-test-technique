<script setup lang="ts">
import { computed } from "vue";
import { ChevronsUpDown, LogOut } from "lucide-vue-next";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useLogout } from "@/modules/auth/composables/useAuth";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const { authenticatedUser } = useAuthStore();
const { mutate: logout, isPending } = useLogout();

const emailInitial = computed(() => authenticatedUser.email.charAt(0).toUpperCase());
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg">
            <Avatar class="size-8 rounded-lg">
              <AvatarFallback class="rounded-lg text-xs">{{ emailInitial }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate text-xs text-muted-foreground">
                {{ authenticatedUser.email }}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-(--reka-popper-anchor-width)">
          <DropdownMenuItem :disabled="isPending" @click="logout()">
            <LogOut class="size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
