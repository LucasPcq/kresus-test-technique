import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { http, HttpResponse } from "msw";

import { server } from "@/test/server";
import { apiUrl, mockAuthUser } from "@/test/handlers";

import { requireAuth, redirectIfAuthenticated } from "@/modules/auth/guards/auth.guard";

const buildRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/login",
        name: "login",
        component: { template: "<div />" },
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: "/register",
        name: "register",
        component: { template: "<div />" },
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: "/",
        component: { template: "<RouterView />" },
        beforeEnter: requireAuth,
        children: [{ path: "", name: "home", component: { template: "<div />" } }],
      },
      { path: "/:pathMatch(.*)*", name: "not-found", component: { template: "<div />" } },
    ],
  });

describe("router guard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.cookie = "session=; Max-Age=0; path=/";
  });

  it("should redirect to /login when user is unauthenticated", async () => {
    const router = buildRouter();
    await router.push("/");
    expect(router.currentRoute.value.name).toBe("login");
  });

  it("should allow access to / when user is authenticated", async () => {
    document.cookie = "session=1; path=/";
    server.use(http.get(apiUrl("/auth/me"), () => HttpResponse.json(mockAuthUser)));

    const router = buildRouter();
    await router.push("/");
    expect(router.currentRoute.value.name).toBe("home");
  });

  it("should redirect to / when authenticated user visits /login", async () => {
    document.cookie = "session=1; path=/";
    server.use(http.get(apiUrl("/auth/me"), () => HttpResponse.json(mockAuthUser)));

    const router = buildRouter();
    await router.push("/login");
    expect(router.currentRoute.value.name).toBe("home");
  });

  it("should allow access to /login when user is unauthenticated", async () => {
    const router = buildRouter();
    await router.push("/login");
    expect(router.currentRoute.value.name).toBe("login");
  });
});
