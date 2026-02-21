import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { Priority } from "@kresus/contract";

import TaskFilters from "../components/TaskFilters.vue";

const defaultProps = {
  titleSearch: undefined as string | undefined,
  completed: undefined as boolean | undefined,
  priority: undefined as Priority | undefined,
  dateFrom: undefined as string | undefined,
  dateTo: undefined as string | undefined,
  hasActiveFilters: false,
};

describe("TaskFilters", () => {
  it("should render the search input", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should render completion toggle group with 3 options", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.text()).toContain("Toutes");
    expect(wrapper.text()).toContain("À faire");
    expect(wrapper.text()).toContain("Terminées");
  });

  it("should render the priority select", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.text()).toContain("Priorité");
  });

  it("should render date range button", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.text()).toContain("Date d'exécution");
  });

  it("should disable reset button when no active filters", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });
    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Réinitialiser"));

    expect(resetBtn?.exists()).toBe(true);
    expect((resetBtn?.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("should enable reset button when filters are active", () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true },
    });
    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Réinitialiser"));

    expect((resetBtn?.element as HTMLButtonElement).disabled).toBe(false);
  });

  it("should emit reset-filters when reset button is clicked", async () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true },
    });

    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Réinitialiser"));
    await resetBtn?.trigger("click");

    expect(wrapper.emitted("reset-filters")).toHaveLength(1);
  });

  it("should initialize search input with titleSearch prop", () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, titleSearch: "rapport" },
    });

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("rapport");
  });
});
