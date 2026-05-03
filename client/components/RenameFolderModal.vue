<template>
  <Teleport to="body">
    <div class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="$emit('close')">
      <div class="rounded-lg p-6 shadow-xl w-96" style="background: var(--color-bg-elevated); border: 1px solid var(--color-border)">
        <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text)">Rename Folder</h3>
        <input
          ref="inputRef"
          v-model="newName"
          class="w-full rounded px-3 py-2 text-sm outline-none mb-4"
          style="background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text)"
          placeholder="Folder name"
          @keydown.enter="rename"
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
            :disabled="saving"
            @click="rename"
          >{{ saving ? "Renaming…" : "Rename" }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { renameFolder } from "../api.js";
import { useVaultStore } from "../store.js";

const props = defineProps({ folderPath: { type: String, required: true } });
const emit = defineEmits(["close"]);
const store = useVaultStore();
const router = useRouter();

const currentName = props.folderPath.includes("/")
  ? props.folderPath.slice(props.folderPath.lastIndexOf("/") + 1)
  : props.folderPath;
const parent = props.folderPath.includes("/")
  ? props.folderPath.slice(0, props.folderPath.lastIndexOf("/"))
  : "";

const newName = ref(currentName);
const saving = ref(false);
const error = ref("");
const inputRef = ref(null);

onMounted(() => {
  inputRef.value?.focus();
  inputRef.value?.select();
});

async function rename() {
  const name = newName.value.trim();
  if (!name) { error.value = "Name is required"; return; }
  if (name === currentName) { emit("close"); return; }
  if (name.includes("/")) { error.value = "Name must not contain slashes"; return; }
  saving.value = true;
  error.value = "";
  try {
    const newPath = parent ? `${parent}/${name}` : name;
    await renameFolder(props.folderPath, name);
    if (store.activeNotePath?.startsWith(props.folderPath + "/")) {
      const updated = newPath + store.activeNotePath.slice(props.folderPath.length);
      store.setActiveNote(updated);
      router.push(`/note/${updated.replace(/\.md$/i, "")}`);
    }
    await store.fetchTree();
    emit("close");
  } catch (e) {
    error.value = e.response?.data?.detail ?? "Failed to rename folder";
  } finally {
    saving.value = false;
  }
}
</script>
