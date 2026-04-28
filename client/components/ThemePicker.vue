<template>
  <div ref="pickerRef" class="relative">
    <button
      class="flex items-center justify-center w-8 h-8 rounded transition-colors"
      :style="`background: var(--color-bg-elevated); color: var(--color-text-muted)`"
      :title="`Theme: ${activeTheme?.name}`"
      @click.stop="isOpen = !isOpen"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-1 rounded-lg shadow-lg z-50 overflow-hidden"
      :style="`background: var(--color-bg-elevated); border: 1px solid var(--color-border); min-width: 200px`"
      @click.stop
    >
      <div class="px-3 py-2 text-xs font-semibold border-b" :style="`color: var(--color-text-muted); border-color: var(--color-border)`">
        Colour Scheme
      </div>
      <div class="py-1">
        <button
          v-for="theme in themes"
          :key="theme.id"
          class="flex items-center gap-3 w-full px-3 py-2 text-sm text-left transition-colors"
          :style="`color: var(--color-text); background: ${activeThemeId === theme.id ? 'var(--color-bg-sidebar)' : 'transparent'}`"
          @click="selectTheme(theme.id)"
          @mouseenter="(e) => e.currentTarget.style.background = 'var(--color-bg-sidebar)'"
          @mouseleave="(e) => e.currentTarget.style.background = activeThemeId === theme.id ? 'var(--color-bg-sidebar)' : 'transparent'"
        >
          <span
            class="shrink-0 w-4 h-4 rounded-full border-2"
            :style="`background: ${theme.colors.brand}; border-color: ${activeThemeId === theme.id ? theme.colors['brand-hover'] : 'transparent'}`"
          />
          <span class="flex-1">{{ theme.name }}</span>
          <svg v-if="activeThemeId === theme.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="`color: var(--color-brand)`">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTheme } from "../useTheme.js";

const { themes, activeThemeId, applyTheme } = useTheme();
const isOpen = ref(false);
const pickerRef = ref(null);

const activeTheme = computed(() => themes.find((t) => t.id === activeThemeId.value));

function selectTheme(id) {
  applyTheme(id);
  isOpen.value = false;
}

function handleOutsideClick(e) {
  if (pickerRef.value && !pickerRef.value.contains(e.target)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutsideClick));
onUnmounted(() => document.removeEventListener("click", handleOutsideClick));
</script>
