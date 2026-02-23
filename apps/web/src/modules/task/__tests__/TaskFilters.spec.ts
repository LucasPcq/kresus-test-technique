import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { ActiveFilter } from "../task.filter-config";

import TaskFilters from "../components/TaskFilters.vue";

const defaultProps = {
  titleSearch: undefined as string | undefined,
  hasActiveFilters: false,
  activeFilters: [] as ActiveFilter[],
};

describe("TaskFilters", () => {
  it("should render the search input", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should render the add-filter button", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.text()).toContain("Ajouter un filtre");
  });

  it("should not render reset button when no active filters", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });
    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Réinitialiser"));

    expect(resetBtn).toBeUndefined();
  });

  it("should render reset button when filters are active", () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true },
    });
    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Réinitialiser"));

    expect(resetBtn?.exists()).toBe(true);
  });

  it("should emit reset-filters when reset button is clicked", async () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true },
    });

    const resetBtn = wrapper.findAll("button").find((b) => b.text().includes("Réinitialiser"));
    await resetBtn?.trigger("click");

    expect(wrapper.emitted("reset-filters")).toHaveLength(1);
  });

  it("should render filter tags for active filters", () => {
    const activeFilters: ActiveFilter[] = [
      { field: "priority", operator: "eq", value: "HIGH" },
    ];
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true, activeFilters },
    });

    expect(wrapper.text()).toContain("Priorité");
    expect(wrapper.text()).toContain("est");
    expect(wrapper.text()).toContain("Haute");
  });

  it("should render multiple filter tags", () => {
    const activeFilters: ActiveFilter[] = [
      { field: "completed", operator: "eq", value: false },
      { field: "priority", operator: "neq", value: "LOW" },
    ];
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true, activeFilters },
    });

    expect(wrapper.text()).toContain("Statut");
    expect(wrapper.text()).toContain("À faire");
    expect(wrapper.text()).toContain("Priorité");
    expect(wrapper.text()).toContain("n'est pas");
    expect(wrapper.text()).toContain("Basse");
  });

  it("should emit remove-filter when tag remove button is clicked", async () => {
    const activeFilters: ActiveFilter[] = [
      { field: "completed", operator: "eq", value: true },
    ];
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, hasActiveFilters: true, activeFilters },
    });

    const badgeBtns = wrapper.findAll("[data-slot='badge'] button");
    const removeBtn = badgeBtns[badgeBtns.length - 1];
    await removeBtn.trigger("click");

    expect(wrapper.emitted("remove-filter")).toHaveLength(1);
    expect(wrapper.emitted("remove-filter")?.[0]).toEqual(["completed"]);
  });

  it("should initialize search input with titleSearch prop", () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, titleSearch: "rapport" },
    });

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("rapport");
  });
});
