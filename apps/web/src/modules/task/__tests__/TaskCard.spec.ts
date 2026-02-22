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

  it("should have the three dots button hidden by default with group-hover class", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    const menuButton = wrapper.find("button[aria-label='Actions']");
    expect(menuButton.exists()).toBe(true);

    const menuWrapper = menuButton.element.closest(".opacity-0");
    expect(menuWrapper).toBeTruthy();
    expect(menuWrapper?.classList.contains("group-hover:opacity-100")).toBe(true);
  });

  it("should have group class on card for hover detection", () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } });

    expect(wrapper.find("[data-slot='card']").classes()).toContain("group");
  });

  it("should open dropdown menu with delete option when three dots is clicked", async () => {
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

  it("should open alert dialog when delete menu item is clicked", async () => {
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
      expect(deleteItem).toBeTruthy();
      deleteItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flushPromises();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("Supprimer la tâche");
      expect(document.body.textContent).toContain("Cette action est irréversible");
    });
  });

  it("should emit delete event when alert dialog confirm is clicked", async () => {
    const wrapper = mount(TaskCard, {
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
      const confirmButton = [...document.body.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Supprimer",
      );
      expect(confirmButton).toBeTruthy();
      confirmButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flushPromises();

    expect(wrapper.emitted("delete")).toBeTruthy();
    expect(wrapper.emitted("delete")?.[0]).toEqual(["1"]);
  });

  it("should close alert dialog when cancel is clicked", async () => {
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
