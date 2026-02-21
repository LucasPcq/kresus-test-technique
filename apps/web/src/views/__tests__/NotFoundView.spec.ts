import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { buildWrapper } from "@/test/mount";

import NotFoundView from "../NotFoundView.vue";

describe("NotFoundView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("displays 404 and 'Page introuvable'", () => {
    const { wrapper } = buildWrapper(NotFoundView);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Page introuvable");
  });

  it("contains a link to /", () => {
    const { wrapper } = buildWrapper(NotFoundView);

    expect(wrapper.find("a[href='/']").exists()).toBe(true);
  });
});
