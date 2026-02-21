import { createRouter, createWebHistory } from "vue-router";

import { requireAuth, redirectIfAuthenticated } from "@/modules/auth/guards/auth.guard";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/components/AppLayout.vue"),
      beforeEnter: requireAuth,
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/modules/home/views/HomeView.vue"),
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/modules/auth/views/LoginView.vue"),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/modules/auth/views/RegisterView.vue"),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

export default router;
