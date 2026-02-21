import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "../App.vue";

describe("App", () => {
  it("mounts without errors", () => {
    const router = createRouter({ history: createWebHashHistory(), routes: [] });
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.exists()).toBe(true);
  });
});
