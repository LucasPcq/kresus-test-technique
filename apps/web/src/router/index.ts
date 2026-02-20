import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../modules/auth/views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../modules/auth/views/RegisterView.vue"),
    },
  ],
});

export default router;
