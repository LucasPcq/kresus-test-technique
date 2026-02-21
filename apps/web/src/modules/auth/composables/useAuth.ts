import { useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import { getMe, login, logout, register } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

import { AUTH_QUERY_KEYS } from "../queryKeys";

export const useLogin = () => {
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      authStore.setUser(user);
      router.push("/");
    },
  });
};

export const useRegister = () => {
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      authStore.setUser(user);
      router.push("/");
    },
  });
};

export const useMe = () => {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: async () => {
      const user = await getMe();
      authStore.setUser(user);
      return user;
    },
    retry: false,
  });
};

export const useLogout = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      authStore.clearUser();
      queryClient.clear();
      router.push("/login");
    },
  });
};
