import { createRouter, createWebHistory } from "vue-router";
import Welcome from "./views/Welcome.vue";
import NoteEditor from "./views/NoteEditor.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "welcome", component: Welcome },
    { path: "/note/:notePath(.*)*", name: "note", component: NoteEditor },
  ],
});

export default router;
