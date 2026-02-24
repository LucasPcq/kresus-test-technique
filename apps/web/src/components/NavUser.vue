<script setup lang="ts">
import { computed } from "vue";
import { ChevronsUpDown, LogOut, Moon, Monitor, Sun } from "lucide-vue-next";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useLogout } from "@/modules/auth/composables/useAuth";
import { useTheme } from "@/composables/useTheme";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const { authenticatedUser } = useAuthStore();
const { mutate: logout, isPending } = useLogout();
const { mode, next: toggleTheme } = useTheme();

const emailInitial = computed(() => authenticatedUser.email.charAt(0).toUpperCase());

const THEME_ICON = { light: Sun, dark: Moon, auto: Monitor } as const;
const THEME_LABEL = { light: "Clair", dark: "Sombre", auto: "Système" } as const;

const themeIcon = computed(() => THEME_ICON[mode.value]);
const themeLabel = computed(() => THEME_LABEL[mode.value]);
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg" class="cursor-pointer border border-sidebar-border hover:bg-sidebar-accent">
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
        <DropdownMenuContent align="end" class="w-(--reka-popper-anchor-width) min-w-56">
          <DropdownMenuItem @click="toggleTheme">
            <component :is="themeIcon" class="size-4" />
            {{ themeLabel }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem :disabled="isPending" @click="logout()">
            <LogOut class="size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
