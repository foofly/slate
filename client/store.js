import { defineStore } from "pinia";
import { ref } from "vue";
import { getTree } from "./api.js";

export const useVaultStore = defineStore("vault", () => {
  const tree = ref([]);
  const activeNotePath = ref(null);
  const isDirty = ref(false);
  const loading = ref(false);

  async function fetchTree() {
    loading.value = true;
    try {
      tree.value = await getTree();
    } finally {
      loading.value = false;
    }
  }

  function setActiveNote(path) {
    activeNotePath.value = path;
  }

  function markDirty() {
    isDirty.value = true;
  }

  function markClean() {
    isDirty.value = false;
  }

  return { tree, activeNotePath, isDirty, loading, fetchTree, setActiveNote, markDirty, markClean };
});
