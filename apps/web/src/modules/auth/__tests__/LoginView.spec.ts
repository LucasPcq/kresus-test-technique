import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { delay, http, HttpResponse } from "msw";

import { server } from "@/test/server";
import { apiUrl, mockAuthUser } from "@/test/handlers";
import { buildWrapper, fillAndSubmitAuthForm } from "@/test/mount";

import { useAuthStore } from "../store/auth.store";

import LoginView from "../views/LoginView.vue";

describe("LoginView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("rendering", () => {
    it("should render email input, password input and submit button", () => {
      const { wrapper } = buildWrapper(LoginView);

      expect(wrapper.find("input[type='email']").exists()).toBe(true);
      expect(wrapper.find("input[type='password']").exists()).toBe(true);
      expect(wrapper.find("button[type='submit']").text()).toBe("Se connecter");
    });

    it("should disable the submit button when the form is empty", () => {
      const { wrapper } = buildWrapper(LoginView);
      const button = wrapper.find("button[type='submit']").element as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    });

    it("should render a link to the registration page", () => {
      const { wrapper } = buildWrapper(LoginView);

      expect(wrapper.find("a[href='/register']").exists()).toBe(true);
    });
  });

  describe("validation", () => {
    it("should not call the API when the form is submitted empty", async () => {
      const { wrapper } = buildWrapper(LoginView);
      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(useAuthStore().isAuthenticated).toBe(false);
    });

    it("should not call the API when the email is invalid", async () => {
      const { wrapper } = buildWrapper(LoginView);
      await fillAndSubmitAuthForm(wrapper, { email: "pas-un-email", password: "password123" });

      expect(useAuthStore().isAuthenticated).toBe(false);
    });
  });

  describe("submission", () => {
    it("should disable the submit button and show 'Connexion...' when the request is pending", async () => {
      server.use(
        http.post(apiUrl("/auth/login"), async () => {
          await delay("infinite");
          return HttpResponse.json(mockAuthUser);
        }),
      );

      const { wrapper } = buildWrapper(LoginView);
      await wrapper.find("input[type='email']").setValue("test@example.com");
      await wrapper.find("input[type='password']").setValue("password123");
      void wrapper.find("form").trigger("submit");

      await vi.waitFor(() => {
        const button = wrapper.find("button[type='submit']");
        expect(button.text()).toBe("Connexion...");
        expect((button.element as HTMLButtonElement).disabled).toBe(true);
      });
    });

    it("should redirect to / and update the store when login succeeds", async () => {
      const { wrapper, router } = buildWrapper(LoginView);
      await fillAndSubmitAuthForm(wrapper, { email: "test@example.com", password: "password123" });

      await vi.waitFor(() => expect(useAuthStore().user).toEqual(mockAuthUser));
      expect(router.currentRoute.value.path).toBe("/");
    });

    it("should display 'Identifiants incorrects' when the API returns 401", async () => {
      server.use(
        http.post(apiUrl("/auth/login"), () =>
          HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
        ),
      );

      const { wrapper } = buildWrapper(LoginView);
      await fillAndSubmitAuthForm(wrapper, { email: "test@example.com", password: "wrong" });

      await vi.waitFor(() => expect(wrapper.text()).toContain("Identifiants incorrects"));
    });

    it("should display 'Une erreur est survenue' when the API returns an unexpected error", async () => {
      server.use(
        http.post(apiUrl("/auth/login"), () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      const { wrapper } = buildWrapper(LoginView);
      await fillAndSubmitAuthForm(wrapper, { email: "test@example.com", password: "password123" });

      await vi.waitFor(() => expect(wrapper.text()).toContain("Une erreur est survenue"));
    });
  });
});
