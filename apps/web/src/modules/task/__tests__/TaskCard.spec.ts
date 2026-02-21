import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { PRIORITY } from "@kresus/contract";
import type { TaskResponse } from "@kresus/contract";

import TaskCard from "../components/TaskCard.vue";

const baseTask: TaskResponse = {
  id: "1",
  title: "Rédiger le rapport",
  content: "Contenu de la tâche",
  priority: PRIORITY.HIGH,
  executionDate: new Date("2026-04-15"),
  completedAt: null,
  createdAt: new Date("2026-02-01"),
  updatedAt: new Date("2026-02-01"),
  userId: "1",
};

describe("TaskCard", () => {
  it("should render the task title", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Rédiger le rapport");
  });

  it("should render truncated content", () => {
    const longContent = "A".repeat(150);
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, content: longContent } },
    });

    expect(wrapper.text()).toContain("…");
    expect(wrapper.text()).not.toContain(longContent);
  });

  it("should render full content when short", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Contenu de la tâche");
  });

  it("should render HIGH priority badge as destructive", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Haute");
  });

  it("should render MEDIUM priority badge", () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, priority: PRIORITY.MEDIUM } },
    });

    expect(wrapper.text()).toContain("Moyenne");
  });

  it("should render LOW priority badge", () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, priority: PRIORITY.LOW } },
    });

    expect(wrapper.text()).toContain("Basse");
  });

  it("should format the execution date in French", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("15");
    expect(wrapper.text()).toMatch(/avr/i);
    expect(wrapper.text()).toContain("2026");
  });

  it("should not show date when executionDate is null", () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, executionDate: null } },
    });

    expect(wrapper.find("[data-slot='card-footer']").exists()).toBe(false);
  });

  it("should apply opacity when task is completed", () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, completedAt: new Date() } },
    });

    expect(wrapper.find("[data-slot='card']").classes()).toContain("opacity-60");
  });

  it("should not apply opacity for incomplete task", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.find("[data-slot='card']").classes()).not.toContain("opacity-60");
  });
});
