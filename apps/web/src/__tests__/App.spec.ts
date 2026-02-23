import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "../App.vue";

describe("App", () => {
  it("should mount without errors when rendered", () => {
    const router = createRouter({ history: createWebHashHistory(), routes: [] });
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.exists()).toBe(true);
  });
});
