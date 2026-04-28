import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import router from "./router.js";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(PrimeVue, { unstyled: true });
app.use(ToastService);
app.mount("#app");
