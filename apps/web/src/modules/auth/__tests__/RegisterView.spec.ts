import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { delay, http, HttpResponse } from "msw";

import { server } from "@/test/server";
import { apiUrl, mockAuthUser } from "@/test/handlers";
import { buildWrapper, fillAndSubmit } from "@/test/mount";

import { useAuthStore } from "../store/auth.store";

import RegisterView from "../views/RegisterView.vue";

describe("RegisterView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("rendering", () => {
    it("should render email input, password input and submit button", () => {
      const { wrapper } = buildWrapper(RegisterView);

      expect(wrapper.find("input[type='email']").exists()).toBe(true);
      expect(wrapper.find("input[type='password']").exists()).toBe(true);
      expect(wrapper.find("button[type='submit']").text()).toBe("S'inscrire");
    });

    it("should render a link to the login page", () => {
      const { wrapper } = buildWrapper(RegisterView);

      expect(wrapper.find("a[href='/login']").exists()).toBe(true);
    });
  });

  describe("validation", () => {
    it("should not call the API when the form is submitted empty", async () => {
      const { wrapper } = buildWrapper(RegisterView);
      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(useAuthStore().user).toBeNull();
    });

    it("should not call the API when the email is invalid", async () => {
      const { wrapper } = buildWrapper(RegisterView);
      await fillAndSubmit(wrapper, { email: "pas-un-email", password: "password123" });

      expect(useAuthStore().user).toBeNull();
    });

    it("should not call the API when the password is shorter than 8 characters", async () => {
      const { wrapper } = buildWrapper(RegisterView);
      await fillAndSubmit(wrapper, { email: "new@example.com", password: "court" });

      expect(useAuthStore().user).toBeNull();
    });
  });

  describe("submission", () => {
    it("should disable the submit button and show 'Inscription...' when the request is pending", async () => {
      server.use(
        http.post(apiUrl("/auth/register"), async () => {
          await delay("infinite");
          return HttpResponse.json(mockAuthUser);
        }),
      );

      const { wrapper } = buildWrapper(RegisterView);
      await wrapper.find("input[type='email']").setValue("new@example.com");
      await wrapper.find("input[type='password']").setValue("password123");
      void wrapper.find("form").trigger("submit");

      await vi.waitFor(() => {
        const button = wrapper.find("button[type='submit']");
        expect(button.text()).toBe("Inscription...");
        expect((button.element as HTMLButtonElement).disabled).toBe(true);
      });
    });

    it("should redirect to / and update the store when registration succeeds", async () => {
      const { wrapper, router } = buildWrapper(RegisterView);
      await fillAndSubmit(wrapper, { email: "new@example.com", password: "password123" });

      await vi.waitFor(() => expect(useAuthStore().user).toEqual(mockAuthUser));
      expect(router.currentRoute.value.path).toBe("/");
    });

    it("should display 'Cet email est déjà utilisé' when the API returns 409", async () => {
      server.use(
        http.post(apiUrl("/auth/register"), () =>
          HttpResponse.json({ message: "Conflict" }, { status: 409 }),
        ),
      );

      const { wrapper } = buildWrapper(RegisterView);
      await fillAndSubmit(wrapper, { email: "existing@example.com", password: "password123" });

      await vi.waitFor(() => expect(wrapper.text()).toContain("Cet email est déjà utilisé"));
    });

    it("should display 'Une erreur est survenue' when the API returns an unexpected error", async () => {
      server.use(
        http.post(apiUrl("/auth/register"), () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      const { wrapper } = buildWrapper(RegisterView);
      await fillAndSubmit(wrapper, { email: "new@example.com", password: "password123" });

      await vi.waitFor(() => expect(wrapper.text()).toContain("Une erreur est survenue"));
    });
  });
});
