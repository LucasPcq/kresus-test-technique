import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

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
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render the task title", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Rédiger le rapport");
  });

  it("should render full content", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Contenu de la tâche");
  });

  it("should render HIGH priority badge", () => {
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

  describe("completion toggle", () => {
    it("should show 'Marquer comme complétée' button for incomplete task", () => {
      const wrapper = mount(TaskCard, { props: { task: baseTask } });

      expect(wrapper.find("button[aria-label='Marquer comme complétée']").exists()).toBe(true);
    });

    it("should show 'Marquer comme non complétée' button for completed task", () => {
      const wrapper = mount(TaskCard, {
        props: { task: { ...baseTask, completedAt: new Date() } },
      });

      expect(wrapper.find("button[aria-label='Marquer comme non complétée']").exists()).toBe(true);
    });
  });

  describe("delete flow", () => {
    it("should show delete option in the actions menu", async () => {
      mount(TaskCard, {
        props: { task: baseTask },
        attachTo: document.body,
      });

      const menuButton = document.body.querySelector("button[aria-label='Actions']");
      menuButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.textContent).toContain("Supprimer");
      });
    });

    it("should open confirmation dialog when delete is clicked", async () => {
      mount(TaskCard, {
        props: { task: baseTask },
        attachTo: document.body,
      });

      const menuButton = document.body.querySelector("button[aria-label='Actions']");
      menuButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        const deleteItem = [...document.body.querySelectorAll("[role='menuitem']")].find((el) =>
          el.textContent?.includes("Supprimer"),
        );
        deleteItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.textContent).toContain("Supprimer la tâche");
        expect(document.body.textContent).toContain("Cette action est irréversible");
      });
    });

    it("should close confirmation dialog when cancel is clicked", async () => {
      mount(TaskCard, {
        props: { task: baseTask },
        attachTo: document.body,
      });

      const menuButton = document.body.querySelector("button[aria-label='Actions']");
      menuButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        const deleteItem = [...document.body.querySelectorAll("[role='menuitem']")].find((el) =>
          el.textContent?.includes("Supprimer"),
        );
        deleteItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.textContent).toContain("Supprimer la tâche");
      });

      const cancelButton = [...document.body.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Annuler",
      );
      cancelButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.querySelector("[role='alertdialog']")).toBeNull();
      });
    });

    it("should show loading state when isDeleting is true", async () => {
      mount(TaskCard, {
        props: { task: baseTask, isDeleting: true },
        attachTo: document.body,
      });

      const menuButton = document.body.querySelector("button[aria-label='Actions']");
      menuButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        const deleteItem = [...document.body.querySelectorAll("[role='menuitem']")].find((el) =>
          el.textContent?.includes("Supprimer"),
        );
        deleteItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.textContent).toContain("Suppression…");
        const confirmButton = [...document.body.querySelectorAll("button")].find((b) =>
          b.textContent?.includes("Suppression"),
        );
        expect(confirmButton?.disabled).toBe(true);
      });
    });
  });

  describe("selection mode", () => {
    it("should show checkbox and hide actions menu", () => {
      const wrapper = mount(TaskCard, {
        props: { task: baseTask, selectionMode: true, selected: false },
      });

      expect(wrapper.find("button[role='checkbox']").exists()).toBe(true);
      expect(wrapper.find("button[aria-label='Actions']").exists()).toBe(false);
    });

    it("should hide completion toggle button", () => {
      const wrapper = mount(TaskCard, {
        props: { task: baseTask, selectionMode: true, selected: false },
      });

      expect(wrapper.find("button[aria-label='Marquer comme complétée']").exists()).toBe(false);
    });
  });
});
