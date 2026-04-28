<template>
  <Teleport to="body">
    <div class="fixed inset-0 flex items-start justify-center pt-20 z-50" style="background: rgba(0,0,0,0.6)" @click.self="$emit('close')">
      <div class="rounded-lg shadow-xl w-full max-w-lg" style="background: var(--color-bg-elevated); border: 1px solid var(--color-border)">
        <div class="flex items-center gap-2 px-4 py-3 border-b" style="border-color: var(--color-border)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-text-muted)"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref="inputRef"
            v-model="query"
            class="flex-1 bg-transparent outline-none text-sm"
            style="color: var(--color-text)"
            placeholder="Search notes…"
            @keydown.escape="$emit('close')"
          />
        </div>
        <div class="max-h-80 overflow-y-auto">
          <div v-if="loading" class="px-4 py-3 text-xs" style="color: var(--color-text-muted)">Searching…</div>
          <div v-else-if="query && !results.length" class="px-4 py-3 text-xs" style="color: var(--color-text-muted)">No results</div>
          <button
            v-for="r in results"
            :key="r.path"
            class="w-full text-left px-4 py-3 border-b transition-colors block"
            style="border-color: var(--color-border)"
            :style="{ background: 'transparent' }"
            @mouseenter="(e) => e.currentTarget.style.background = 'var(--color-bg)'"
            @mouseleave="(e) => e.currentTarget.style.background = 'transparent'"
            @click="open(r)"
          >
            <div class="text-sm font-medium mb-0.5" style="color: var(--color-text)">{{ r.title }}</div>
            <div class="text-xs truncate" style="color: var(--color-text-muted)" v-html="r.snippet || r.path" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { search } from "../api.js";
import { useVaultStore } from "../store.js";
import { debounce } from "../helpers.js";

const emit = defineEmits(["close"]);
const router = useRouter();
const store = useVaultStore();
const query = ref("");
const results = ref([]);
const loading = ref(false);
const inputRef = ref(null);

onMounted(() => inputRef.value?.focus());

const doSearch = debounce(async (q) => {
  if (!q.trim()) { results.value = []; return; }
  loading.value = true;
  try {
    results.value = await search(q);
  } finally {
    loading.value = false;
  }
}, 300);

watch(query, doSearch);

function open(result) {
  const notePath = result.path.replace(/\.md$/i, "");
  store.setActiveNote(result.path);
  router.push(`/note/${notePath}`);
  emit("close");
}
</script>
