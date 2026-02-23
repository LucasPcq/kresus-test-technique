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
  it("should render the search input when mounted", () => {
    const wrapper = mount(TaskFilters, { props: defaultProps });

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should render the add-filter button when mounted", () => {
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

  it("should render filter tags when active filters are provided", () => {
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

  it("should render multiple filter tags when multiple filters are active", () => {
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

  it("should initialize search input when titleSearch prop is provided", () => {
    const wrapper = mount(TaskFilters, {
      props: { ...defaultProps, titleSearch: "rapport" },
    });

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("rapport");
  });
});
