<template>
  <div class="flex flex-col items-center justify-center h-full gap-4" style="color: var(--color-text-muted)">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <div class="text-center">
      <p class="text-base font-medium mb-1" style="color: var(--color-text)">Slate</p>
      <p class="text-sm">Select a note from the sidebar or create a new one.</p>
    </div>
    <div class="flex gap-2 text-xs mt-2">
      <kbd class="px-2 py-1 rounded" style="background: var(--color-bg-elevated); border: 1px solid var(--color-border)">/</kbd>
      <span>search</span>
      <span class="mx-2">·</span>
      <kbd class="px-2 py-1 rounded" style="background: var(--color-bg-elevated); border: 1px solid var(--color-border)">Ctrl+Alt+N</kbd>
      <span>new note</span>
    </div>
  </div>
</template>
