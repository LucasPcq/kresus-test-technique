import type { NavigationGuard } from "vue-router";

import { useAuthStore } from "@/modules/auth/store/auth.store";

export const requireAuth: NavigationGuard = async () => {
  const authStore = useAuthStore();
  await authStore.initialize();
  if (!authStore.isAuthenticated) return { name: "login" };
};

export const redirectIfAuthenticated: NavigationGuard = async () => {
  const authStore = useAuthStore();
  await authStore.initialize();
  if (authStore.isAuthenticated) return { name: "home" };
};
