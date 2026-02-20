import { useRouter } from "vue-router";
import { useMutation } from "@tanstack/vue-query";

import { login, register } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

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
