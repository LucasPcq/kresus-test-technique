import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { http, HttpResponse } from "msw";

import { TASK_CONTENT_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@kresus/contract";

import { server } from "@/test/server";
import { apiUrl } from "@/test/handlers";
import { buildWrapper } from "@/test/mount";

import TaskCreateDialog from "../components/TaskCreateDialog.vue";

const mountDialog = async (props: { open: boolean } = { open: true }) => {
  const result = buildWrapper(TaskCreateDialog, props, { attachTo: document.body });
  await flushPromises();
  return result;
};

const fillForm = async () => {
  const input = document.body.querySelector("input");
  const textarea = document.body.querySelector("textarea");

  if (input) {
    input.value = "Ma nouvelle tâche";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (textarea) {
    textarea.value = "Description de test";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  await flushPromises();
};

const submitForm = async () => {
  const form = document.body.querySelector("form");
  form?.dispatchEvent(new Event("submit", { bubbles: true }));
  await flushPromises();
};

describe("TaskCreateDialog", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render the dialog with title when open", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain("Nouvelle tâche");
    expect(document.body.textContent).toContain(
      "Remplissez les informations pour créer une nouvelle tâche.",
    );
  });

  it("should not render when open is false", async () => {
    await mountDialog({ open: false });

    expect(document.body.querySelector("form")).toBeNull();
  });

  it("should show all form fields", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain("Titre");
    expect(document.body.textContent).toContain("Description");
    expect(document.body.textContent).toContain("Priorité");
    expect(document.body.textContent).toContain("Date d'exécution");
    expect(document.body.textContent).toContain("Tâche complétée");
  });

  it("should show cancel and create buttons", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain("Annuler");
    expect(document.body.textContent).toContain("Créer");
  });

  it("should have submit button disabled when form is empty", async () => {
    await mountDialog();

    const buttons = [...document.body.querySelectorAll("button")];
    const submitButton = buttons.find((b) => b.textContent?.includes("Créer"));

    expect(submitButton?.disabled).toBe(true);
  });

  it("should enable submit button when required fields are filled", async () => {
    await mountDialog();
    await fillForm();

    await vi.waitFor(() => {
      const buttons = [...document.body.querySelectorAll("button")];
      const submitButton = buttons.find((b) => b.textContent?.includes("Créer"));
      expect(submitButton?.disabled).toBe(false);
    });
  });

  it("should emit close when cancel is clicked", async () => {
    const { wrapper } = await mountDialog();

    const buttons = [...document.body.querySelectorAll("button")];
    const cancelButton = buttons.find((b) => b.textContent?.includes("Annuler"));
    expect(cancelButton).toBeTruthy();

    cancelButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushPromises();

    expect(wrapper.emitted("update:open")).toBeTruthy();
  });

  it("should close the dialog after successful creation", async () => {
    const { wrapper } = await mountDialog();

    await fillForm();
    await submitForm();

    await vi.waitFor(() => {
      expect(wrapper.emitted("update:open")).toBeTruthy();
    });
  });

  it("should show error message when API returns an error", async () => {
    server.use(
      http.post(apiUrl("/tasks"), () =>
        HttpResponse.json({ message: "Bad request" }, { status: 400 }),
      ),
    );

    await mountDialog();
    await fillForm();
    await submitForm();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("Données invalides");
    });
  });

  it("should show generic error message for server errors", async () => {
    server.use(
      http.post(apiUrl("/tasks"), () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    await mountDialog();
    await fillForm();
    await submitForm();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("Une erreur est survenue");
    });
  });

  it("should show asterisks on required fields", async () => {
    await mountDialog();

    const labels = [...document.body.querySelectorAll("label")];
    const titleLabel = labels.find((l) => l.textContent?.includes("Titre"));
    const descriptionLabel = labels.find((l) => l.textContent?.includes("Description"));
    const priorityLabel = labels.find((l) => l.textContent?.includes("Priorité"));

    expect(titleLabel?.querySelector(".text-destructive")?.textContent).toBe("*");
    expect(descriptionLabel?.querySelector(".text-destructive")?.textContent).toBe("*");
    expect(priorityLabel?.querySelector(".text-destructive")?.textContent).toBe("*");
  });

  it("should not show asterisk on optional fields", async () => {
    await mountDialog();

    const labels = [...document.body.querySelectorAll("label")];
    const dateLabel = labels.find((l) => l.textContent?.includes("Date d'exécution"));
    const completedLabel = labels.find((l) => l.textContent?.includes("Tâche complétée"));

    expect(dateLabel?.querySelector(".text-destructive")).toBeNull();
    expect(completedLabel?.querySelector(".text-destructive")).toBeNull();
  });

  it("should show character count for title field", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain(`0/${TASK_TITLE_MAX_LENGTH}`);

    const input = document.body.querySelector("input");
    if (input) {
      input.value = "Hello";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    await flushPromises();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain(`5/${TASK_TITLE_MAX_LENGTH}`);
    });
  });

  it("should show character count for description field", async () => {
    await mountDialog();

    expect(document.body.textContent).toContain(`0/${TASK_CONTENT_MAX_LENGTH}`);

    const textarea = document.body.querySelector("textarea");
    if (textarea) {
      textarea.value = "Test description";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
    await flushPromises();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain(`16/${TASK_CONTENT_MAX_LENGTH}`);
    });
  });

  it("should enforce maxlength on title and description inputs", async () => {
    await mountDialog();

    const input = document.body.querySelector("input");
    const textarea = document.body.querySelector("textarea");

    expect(input?.getAttribute("maxlength")).toBe(String(TASK_TITLE_MAX_LENGTH));
    expect(textarea?.getAttribute("maxlength")).toBe(String(TASK_CONTENT_MAX_LENGTH));
  });
});
