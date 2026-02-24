import type { Component } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

import { MutationCache, QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { getApiErrorMessage } from "@/api/error";

import type { VueWrapper } from "@vue/test-utils";
import { flushPromises, mount } from "@vue/test-utils";

export function buildWrapper(
  component: Component,
  props?: Record<string, unknown>,
  options?: { attachTo?: Element },
) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/login", component: { template: "<div />" } },
      { path: "/register", component: { template: "<div />" } },
    ],
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressErrorToast) return;
        toast.error(getApiErrorMessage(error));
      },
    }),
  });

  return {
    wrapper: mount(component, {
      props,
      attachTo: options?.attachTo,
      global: { plugins: [pinia, router, [VueQueryPlugin, { queryClient }]] },
    }),
    router,
  };
}

export async function fillAndSubmitAuthForm(
  wrapper: VueWrapper,
  { email, password }: { email: string; password: string },
) {
  await wrapper.find("input[type='email']").setValue(email);
  await wrapper.find("input[type='password']").setValue(password);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}
