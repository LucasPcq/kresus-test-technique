import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { http, HttpResponse } from "msw";

import { server } from "@/test/server";
import { apiUrl } from "@/test/handlers";
import { mockTasks } from "@/test/mocks";
import { buildWrapper } from "@/test/mount";

import TaskEditDialog from "../components/TaskEditDialog.vue";

const task = mockTasks[0];
if (!task) throw new Error("mockTasks is empty");

const mountDialog = async () => {
  const result = buildWrapper(TaskEditDialog, { task, open: true }, { attachTo: document.body });
  await flushPromises();
  return result;
};

const changeTitle = async (value: string) => {
  const input = document.body.querySelector("input");
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  await flushPromises();
};

const submitForm = async () => {
  const form = document.body.querySelector("form");
  form?.dispatchEvent(new Event("submit", { bubbles: true }));
  await flushPromises();
};

describe("TaskEditDialog", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render the dialog with edit title when open", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain("Modifier la tâche");
    expect(document.body.textContent).toContain("Modifiez les informations de la tâche.");
  });

  it("should pre-fill form fields when task data is provided", async () => {
    await mountDialog();

    const input = document.body.querySelector("input");
    const textarea = document.body.querySelector("textarea");

    expect(input?.value).toBe(task.title);
    expect(textarea?.value).toBe(task.content);
    expect(document.body.textContent).toContain("Haute");
  });

  it("should pre-fill execution date when task has one", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain("avr");
    expect(document.body.textContent).toContain("2026");
  });

  it("should have submit button disabled when form is untouched", async () => {
    await mountDialog();

    const buttons = [...document.body.querySelectorAll("button")];
    const submitButton = buttons.find((b) => b.textContent?.includes("Modifier"));

    expect(submitButton?.disabled).toBe(true);
  });

  it("should enable submit button when a field is changed", async () => {
    await mountDialog();
    await changeTitle("Titre modifié");

    await vi.waitFor(() => {
      const buttons = [...document.body.querySelectorAll("button")];
      const submitButton = buttons.find((b) => b.textContent?.includes("Modifier"));
      expect(submitButton?.disabled).toBe(false);
    });
  });

  it("should close the dialog when edit succeeds", async () => {
    server.use(
      http.patch(apiUrl(`/tasks/${task.id}`), () => HttpResponse.json({ ...task, title: "Titre modifié" })),
    );

    await mountDialog();
    await changeTitle("Titre modifié");
    await submitForm();

    await vi.waitFor(() => {
      expect(document.body.querySelector("form")).toBeNull();
    });
  });

  it("should show error message when API returns 400", async () => {
    server.use(
      http.patch(apiUrl(`/tasks/${task.id}`), () =>
        HttpResponse.json({ message: "Bad request" }, { status: 400 }),
      ),
    );

    await mountDialog();
    await changeTitle("Titre modifié");
    await submitForm();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("Données invalides");
    });
  });

  it("should show generic error message when API returns a server error", async () => {
    server.use(
      http.patch(apiUrl(`/tasks/${task.id}`), () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    await mountDialog();
    await changeTitle("Titre modifié");
    await submitForm();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("Une erreur est survenue");
    });
  });

  it("should enable submit button when checkbox is toggled", async () => {
    await mountDialog();

    const checkbox = document.body.querySelector("button[role='checkbox']") as HTMLElement;
    expect(checkbox).toBeTruthy();

    checkbox.click();
    await flushPromises();

    await vi.waitFor(() => {
      const buttons = [...document.body.querySelectorAll("button")];
      const submitButton = buttons.find((b) => b.textContent?.includes("Modifier"));
      expect(submitButton?.disabled).toBe(false);
    });
  });

  it("should not restrict past dates when calendar is opened", async () => {
    await mountDialog();

    const dateButton = [...document.body.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("avr"),
    );
    dateButton?.click();
    await flushPromises();

    await vi.waitFor(() => {
      const disabledCells = document.body.querySelectorAll(
        "[data-slot='calendar-cell-trigger'][data-disabled]",
      );
      expect(disabledCells.length).toBe(0);
    });
  });
});
