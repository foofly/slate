<template>
  <div class="flex items-center gap-2 px-4 py-2 border-b shrink-0" style="border-color: var(--color-border); background: var(--color-bg-sidebar)">
    <span class="font-semibold text-sm tracking-wide" style="color: var(--color-brand)">Slate</span>
    <div class="flex-1" />
    <ThemePicker />
    <button
      class="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors"
      style="background: var(--color-bg-elevated); color: var(--color-text-muted)"
      @click="$emit('search')"
      title="Search (press /)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      Search
      <kbd class="ml-1 px-1 rounded text-xs" style="background: var(--color-border)">/</kbd>
    </button>
    <button
      class="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors"
      style="background: var(--color-brand); color: #1e1e2e"
      @click="$emit('new-note')"
      title="New Note (Ctrl+Alt+N)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      New Note
    </button>
  </div>
</template>

<script setup>
import ThemePicker from "./ThemePicker.vue";
defineEmits(["search", "new-note"]);
</script>
