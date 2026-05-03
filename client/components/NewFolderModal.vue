<template>
  <Teleport to="body">
    <div class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="$emit('close')">
      <div class="rounded-lg p-6 shadow-xl w-96" style="background: var(--color-bg-elevated); border: 1px solid var(--color-border)">
        <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text)">New Folder</h3>
        <p class="text-xs mb-2" style="color: var(--color-text-muted)">Path (e.g. <code>Projects/Work</code>)</p>
        <input
          ref="inputRef"
          v-model="folderPath"
          class="w-full rounded px-3 py-2 text-sm outline-none mb-4"
          style="background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text)"
          placeholder="My Folder"
          @keydown.enter="create"
          @keydown.escape="$emit('close')"
        />
        <p v-if="error" class="text-xs mb-3" style="color: #f38ba8">{{ error }}</p>
        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 rounded text-sm"
            style="background: var(--color-bg); color: var(--color-text-muted)"
            @click="$emit('close')"
          >Cancel</button>
          <button
            class="px-3 py-1.5 rounded text-sm"
            style="background: var(--color-brand); color: #1e1e2e"
            :disabled="creating"
            @click="create"
          >{{ creating ? "Creating…" : "Create" }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { createFolder } from "../api.js";
import { useVaultStore } from "../store.js";

const props = defineProps({ parentPath: { type: String, default: "" } });
const emit = defineEmits(["close"]);
const store = useVaultStore();
const folderPath = ref(props.parentPath ? `${props.parentPath}/` : "");
const creating = ref(false);
const error = ref("");
const inputRef = ref(null);

onMounted(() => inputRef.value?.focus());

async function create() {
  const raw = folderPath.value.trim();
  if (!raw) { error.value = "Path is required"; return; }
  if (raw.toLowerCase().endsWith(".md")) {
    error.value = "Folder names must not end with .md";
    return;
  }
  creating.value = true;
  error.value = "";
  try {
    await createFolder(raw);
    await store.fetchTree();
    emit("close");
  } catch (e) {
    error.value = e.response?.data?.detail ?? "Failed to create folder";
  } finally {
    creating.value = false;
  }
}
</script>
