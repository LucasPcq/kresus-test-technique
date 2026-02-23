import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

import { useAuthStore } from "@/modules/auth/store/auth.store";

import AppLayout from "../AppLayout.vue";

function mountLayout() {
  const pinia = createPinia();
  setActivePinia(pinia);

  const authStore = useAuthStore();
  authStore.setUser({ id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" });

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { template: "<div />" } }],
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return mount(AppLayout, {
    global: { plugins: [pinia, router, [VueQueryPlugin, { queryClient }]] },
  });
}

describe("AppLayout", () => {
  it("should render the sidebar in collapsed state", () => {
    const wrapper = mountLayout();

    expect(wrapper.find("[data-state='collapsed']").exists()).toBe(true);
  });

  it("should render the sidebar with icon collapsible mode", () => {
    const wrapper = mountLayout();

    expect(wrapper.find("[data-collapsible='icon']").exists()).toBe(true);
  });

  it("should render the content area", () => {
    const wrapper = mountLayout();

    expect(wrapper.find("[data-slot='sidebar-inset']").exists()).toBe(true);
  });
});
