<template>
  <div class="flex h-full overflow-hidden" style="background: var(--color-bg); color: var(--color-text)">
    <FileTree class="shrink-0 border-r overflow-y-auto" style="width: 260px; border-color: var(--color-border); background: var(--color-bg-sidebar)" />
    <div class="flex flex-col flex-1 overflow-hidden">
      <TopBar @search="searchOpen = true" @new-note="newNoteOpen = true" />
      <div class="flex-1 overflow-auto">
        <router-view />
      </div>
    </div>
    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
    <NewNoteModal v-if="newNoteOpen" @close="newNoteOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Mousetrap from "mousetrap";
import FileTree from "./components/FileTree.vue";
import TopBar from "./components/TopBar.vue";
import SearchModal from "./components/SearchModal.vue";
import NewNoteModal from "./components/NewNoteModal.vue";

const searchOpen = ref(false);
const newNoteOpen = ref(false);

onMounted(() => {
  Mousetrap.bind("/", (e) => {
    e.preventDefault();
    searchOpen.value = true;
  });
  Mousetrap.bind("mod+alt+n", (e) => {
    e.preventDefault();
    newNoteOpen.value = true;
  });
});

onUnmounted(() => {
  Mousetrap.unbind("/");
  Mousetrap.unbind("mod+alt+n");
});
</script>
