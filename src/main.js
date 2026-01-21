import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "@/style/element-plus.scss";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "@/style/main.scss";

import App from "./App.vue";
import router from "./router";
import CommonCard from "@/components/CommonCard.vue";

const app = createApp(App);

app.component("CommonCard", CommonCard);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(createPinia());
app.use(router);

app.mount("#app");
