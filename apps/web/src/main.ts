import { MutationCache, QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { toast } from "vue-sonner";

import { apiClient } from "./api/client";
import { getApiErrorMessage } from "./api/error";

import { setFrenchZodErrorMap } from "./lib/zod-error-map";

import { useAuthStore } from "./modules/auth/store/auth.store";

import router from "./router";

import App from "./App.vue";

import "./assets/index.css";

setFrenchZodErrorMap();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressErrorToast) return;
      toast.error(getApiErrorMessage(error));
    },
  }),
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient, enableDevtoolsV6Plugin: true });

apiClient.setOnAuthExpired(() => {
  useAuthStore().clearUser();
  router.push("/login");
});

app.mount("#app");
