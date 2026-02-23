import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { buildWrapper } from "@/test/mount";

import NotFoundView from "../NotFoundView.vue";

describe("NotFoundView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should display 404 and 'Page introuvable' when rendered", () => {
    const { wrapper } = buildWrapper(NotFoundView);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Page introuvable");
  });

  it("should contain a link to / when rendered", () => {
    const { wrapper } = buildWrapper(NotFoundView);

    expect(wrapper.find("a[href='/']").exists()).toBe(true);
  });
});
