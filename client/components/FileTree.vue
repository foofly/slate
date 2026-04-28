<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-3 py-2 border-b" style="border-color: var(--color-border)">
      <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Vault</span>
      <button
        class="p-1 rounded transition-colors"
        style="color: var(--color-text-muted)"
        @click="store.fetchTree()"
        title="Refresh"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto py-1">
      <div v-if="store.loading" class="px-3 py-2 text-xs" style="color: var(--color-text-muted)">Loading…</div>
      <div v-else-if="!store.tree.length" class="px-3 py-2 text-xs" style="color: var(--color-text-muted)">No notes yet.</div>
      <TreeNode v-for="node in store.tree" :key="node.path" :node="node" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useVaultStore } from "../store.js";
import TreeNode from "./TreeNode.vue";

const store = useVaultStore();
onMounted(() => store.fetchTree());
</script>
