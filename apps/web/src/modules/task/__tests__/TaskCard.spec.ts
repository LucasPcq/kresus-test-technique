import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

import { PRIORITY } from "@kresus/contract";
import type { TaskResponse } from "@kresus/contract";

import { buildWrapper } from "@/test/mount";

import TaskCard from "../components/TaskCard.vue";

const baseTask: TaskResponse = {
  id: "550e8400-e29b-41d4-a716-446655440101",
  title: "Rédiger le rapport",
  content: "Contenu de la tâche",
  priority: PRIORITY.HIGH,
  executionDate: new Date("2026-04-15"),
  completedAt: null,
  createdAt: new Date("2026-02-01"),
  updatedAt: new Date("2026-02-01"),
  userId: "550e8400-e29b-41d4-a716-446655440001",
};

describe("TaskCard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render the task title when task is provided", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Rédiger le rapport");
  });

  it("should render the content when task is provided", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Contenu de la tâche");
  });

  it("should render 'Haute' badge when task has high priority", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.text()).toContain("Haute");
  });

  it("should render 'Moyenne' badge when task has medium priority", () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, priority: PRIORITY.MEDIUM } },
    });

    expect(wrapper.text()).toContain("Moyenne");
  });

  it("should render 'Basse' badge when task has low priority", () => {
    const wrapper = mount(TaskCard, {
      props: { task: { ...baseTask, priority: PRIORITY.LOW } },
    });

    expect(wrapper.text()).toContain("Basse");
  });

  it("should format the execution date in French when executionDate is set", () => {
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
    it("should show 'Marquer comme complétée' button when task is incomplete", () => {
      const wrapper = mount(TaskCard, { props: { task: baseTask } });

      expect(wrapper.find("button[aria-label='Marquer comme complétée']").exists()).toBe(true);
    });

    it("should show 'Marquer comme non complétée' button when task is completed", () => {
      const wrapper = mount(TaskCard, {
        props: { task: { ...baseTask, completedAt: new Date() } },
      });

      expect(wrapper.find("button[aria-label='Marquer comme non complétée']").exists()).toBe(true);
    });
  });

  describe("edit flow", () => {
    it("should show edit option when actions menu is opened", async () => {
      mount(TaskCard, {
        props: { task: baseTask },
        attachTo: document.body,
      });

      const menuButton = document.body.querySelector("button[aria-label='Actions']");
      menuButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.textContent).toContain("Modifier");
      });
    });

    it("should open edit dialog when edit is clicked", async () => {
      buildWrapper(TaskCard, { task: baseTask }, { attachTo: document.body });

      const menuButton = document.body.querySelector("button[aria-label='Actions']");
      menuButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      await vi.waitFor(() => {
        const editItem = [...document.body.querySelectorAll("[role='menuitem']")].find((el) =>
          el.textContent?.includes("Modifier"),
        );
        editItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flushPromises();

      await vi.waitFor(() => {
        expect(document.body.textContent).toContain("Modifier la tâche");
      });
    });
  });

  describe("delete flow", () => {
    it("should show delete option when actions menu is opened", async () => {
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
    it("should show checkbox and hide actions menu when in selection mode", () => {
      const wrapper = mount(TaskCard, {
        props: { task: baseTask, selectionMode: true, selected: false },
      });

      expect(wrapper.find("button[role='checkbox']").exists()).toBe(true);
      expect(wrapper.find("button[aria-label='Actions']").exists()).toBe(false);
    });

    it("should hide completion toggle button when in selection mode", () => {
      const wrapper = mount(TaskCard, {
        props: { task: baseTask, selectionMode: true, selected: false },
      });

      expect(wrapper.find("button[aria-label='Marquer comme complétée']").exists()).toBe(false);
    });
  });
});
