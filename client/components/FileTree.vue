<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-3 py-2 border-b" style="border-color: var(--color-border)">
      <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Vault</span>
      <div class="flex items-center gap-1">
        <button
          class="p-1 rounded transition-colors"
          style="color: var(--color-text-muted)"
          title="New Folder"
          @click="newFolderOpen = true"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </button>
        <button
          class="p-1 rounded transition-colors"
          style="color: var(--color-text-muted)"
          title="Refresh"
          @click="store.fetchTree()"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        </button>
      </div>
    </div>
    <div
      class="flex-1 overflow-y-auto py-1"
      :class="{ 'drag-over-root': rootDragOver }"
      @dragover.prevent="rootDragOver = true"
      @dragleave="onRootDragLeave"
      @drop.prevent="onRootDrop"
    >
      <div v-if="store.loading" class="px-3 py-2 text-xs" style="color: var(--color-text-muted)">Loading…</div>
      <div v-else-if="!store.tree.length" class="px-3 py-2 text-xs" style="color: var(--color-text-muted)">No notes yet.</div>
      <TreeNode v-for="node in store.tree" :key="node.path" :node="node" />
    </div>
    <NewFolderModal v-if="newFolderOpen" @close="newFolderOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useVaultStore } from "../store.js";
import { moveNote } from "../api.js";
import TreeNode from "./TreeNode.vue";
import NewFolderModal from "./NewFolderModal.vue";

const store = useVaultStore();
const router = useRouter();
const newFolderOpen = ref(false);
const rootDragOver = ref(false);

onMounted(() => store.fetchTree());

function onRootDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) rootDragOver.value = false;
}

async function onRootDrop(e) {
  rootDragOver.value = false;
  const notePath = e.dataTransfer.getData("text/plain");
  if (!notePath?.endsWith(".md")) return;
  const parts = notePath.split("/");
  if (parts.length <= 1) return; // already at root
  const fileName = parts.at(-1);
  if (store.isDirty && store.activeNotePath === notePath)
    if (!confirm("Unsaved changes — move anyway?")) return;
  try {
    await moveNote(notePath, fileName);
    if (store.activeNotePath === notePath) {
      store.setActiveNote(fileName);
      router.push(`/note/${fileName.replace(/\.md$/i, "")}`);
    }
    await store.fetchTree();
  } catch (err) {
    console.error("Move to root failed:", err);
  }
}
</script>

<style scoped>
.drag-over-root {
  outline: 2px dashed var(--color-brand);
  outline-offset: -3px;
  border-radius: 4px;
}
</style>
