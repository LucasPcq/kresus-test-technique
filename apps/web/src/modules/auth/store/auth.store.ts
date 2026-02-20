import { computed, ref } from "vue";
import { defineStore } from "pinia";

import type { AuthUserResponse } from "@kresus/contract";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUserResponse | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  const setUser = (userData: AuthUserResponse) => {
    user.value = userData;
  };

  const clearUser = () => {
    user.value = null;
  };

  return { user, isAuthenticated, setUser, clearUser };
});
