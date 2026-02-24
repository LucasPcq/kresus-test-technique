import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useCookies } from "@vueuse/integrations/useCookies";

import type { AuthUserResponse } from "@kresus/contract";

import { getMe } from "../api/auth.api";

export const useAuthStore = defineStore("auth", () => {
  const cookies = useCookies(["session"]);
  const user = ref<AuthUserResponse | null | undefined>(undefined);
  const isAuthenticated = computed(() => !!user.value);
  const isInitialized = computed(() => user.value !== undefined);

  const authenticatedUser = computed(() => {
    const currentUser = user.value;
    if (!currentUser) throw new Error("No authenticated user");
    return currentUser;
  });

  const setUser = (userData: AuthUserResponse) => {
    user.value = userData;
  };

  const clearUser = () => {
    user.value = null;
  };

  const initialize = async () => {
    if (user.value !== undefined) return;
    if (!cookies.get("session")) {
      user.value = null;
      return;
    }
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      clearUser();
    }
  };

  return {
    user,
    isAuthenticated,
    isInitialized,
    authenticatedUser,
    setUser,
    clearUser,
    initialize,
  };
});
