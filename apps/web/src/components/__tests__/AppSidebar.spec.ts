import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

import i18n from "@/lib/i18n";
import { useAuthStore } from "@/modules/auth/store/auth.store";

import AppSidebar from "../AppSidebar.vue";
import { SidebarProvider } from "@/components/ui/sidebar";

const SidebarWithProvider = {
  template: "<SidebarProvider :open='false'><AppSidebar /></SidebarProvider>",
  components: { SidebarProvider, AppSidebar },
};

function mountSidebar() {
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

  return mount(SidebarWithProvider, {
    global: { plugins: [pinia, router, i18n, [VueQueryPlugin, { queryClient }]] },
  });
}

describe("AppSidebar", () => {
  it("should render the app name in the header", () => {
    const wrapper = mountSidebar();

    expect(wrapper.text()).toContain("Kresus Tasks");
  });

  it("should render in collapsed state", () => {
    const wrapper = mountSidebar();

    expect(wrapper.find("[data-state='collapsed']").exists()).toBe(true);
  });
});
