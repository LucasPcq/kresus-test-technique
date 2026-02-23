import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import i18n from "./lib/i18n";
import { setZodErrorMap } from "./lib/zod-error-map";

import "./assets/index.css";

setZodErrorMap(i18n.global.t);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(VueQueryPlugin, { enableDevtoolsV6Plugin: true });

app.mount("#app");
