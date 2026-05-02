<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-2 border-b shrink-0" style="border-color: var(--color-border); background: var(--color-bg-elevated)">
      <h1 class="flex-1 text-sm font-semibold truncate" style="color: var(--color-text)">{{ noteTitle }}</h1>
      <span v-if="isDirty" class="text-xs" style="color: var(--color-text-muted)">Unsaved</span>
      <button
        class="px-2.5 py-1 rounded text-xs transition-colors"
        style="background: var(--color-bg); color: var(--color-text-muted)"
        @click="toggleEdit"
      >{{ isEditMode ? "Preview" : "Edit" }}</button>
      <button
        class="px-2.5 py-1 rounded text-xs transition-colors"
        :style="{ background: isDirty ? 'var(--color-brand)' : 'var(--color-bg)', color: isDirty ? '#1e1e2e' : 'var(--color-text-muted)' }"
        :disabled="!isDirty || saving"
        @click="save"
      >{{ saving ? "Saving…" : "Save" }}</button>
      <button
        class="px-2.5 py-1 rounded text-xs transition-colors"
        style="background: var(--color-bg); color: var(--color-text-muted)"
        @click="showDeleteConfirm = true"
      >Delete</button>
    </div>

    <!-- Loading -->
    <div v-if="loadingNote" class="flex-1 flex items-center justify-center" style="color: var(--color-text-muted)">
      Loading…
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="flex-1 flex items-center justify-center" style="color: #f38ba8">
      {{ loadError }}
    </div>

    <!-- Editor / Viewer -->
    <template v-else>
      <ToastEditor
        v-if="isEditMode"
        ref="editorRef"
        v-model="content"
        :note-dir="noteDir"
        class="flex-1"
        @change="onContentChange"
      />
      <ToastViewer
        v-else
        :model-value="content"
        :note-dir="noteDir"
        class="flex-1"
      />
    </template>

    <ConfirmModal
      v-if="showDeleteConfirm"
      message="Delete this note? This cannot be undone."
      confirm-label="Delete"
      @confirm="doDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import Mousetrap from "mousetrap";
import ToastEditor from "../components/toastui/ToastEditor.vue";
import ToastViewer from "../components/toastui/ToastViewer.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import { getNote, saveNote, deleteNote } from "../api.js";
import { useVaultStore } from "../store.js";
import { notePathToTitle, debounce } from "../helpers.js";

const route = useRoute();
const router = useRouter();
const store = useVaultStore();

const editorRef = ref(null);
const content = ref("");
const savedContent = ref("");
const isEditMode = ref(false);
const saving = ref(false);
const loadingNote = ref(false);
const loadError = ref("");
const showDeleteConfirm = ref(false);

const notePath = computed(() => {
  const p = route.params.notePath;
  const joined = Array.isArray(p) ? p.join("/") : (p ?? "");
  return joined + ".md";
});

const noteTitle = computed(() => notePathToTitle(notePath.value));
const noteDir = computed(() => {
  const idx = notePath.value.lastIndexOf("/");
  return idx >= 0 ? notePath.value.slice(0, idx) : "";
});
const isDirty = computed(() => content.value !== savedContent.value);

async function loadNote() {
  loadingNote.value = true;
  loadError.value = "";
  try {
    const data = await getNote(notePath.value);
    content.value = data.content;
    savedContent.value = data.content;
    store.setActiveNote(notePath.value);
  } catch (e) {
    loadError.value = e.response?.data?.detail ?? "Failed to load note";
  } finally {
    loadingNote.value = false;
  }
}

async function save() {
  if (!isDirty.value || saving.value) return;
  saving.value = true;
  try {
    await saveNote(notePath.value, content.value);
    savedContent.value = content.value;
    store.markClean();
  } catch (e) {
    console.error("Save failed:", e);
  } finally {
    saving.value = false;
  }
}

const autoSave = debounce(save, 1500);

function onContentChange(md) {
  content.value = md;
  store.markDirty();
  autoSave();
}

function toggleEdit() {
  isEditMode.value = !isEditMode.value;
}

async function doDelete() {
  showDeleteConfirm.value = false;
  await deleteNote(notePath.value);
  await store.fetchTree();
  store.setActiveNote(null);
  router.push("/");
}

onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    if (confirm("You have unsaved changes. Leave anyway?")) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

watch(notePath, loadNote, { immediate: true });

onMounted(() => {
  Mousetrap.bind("mod+s", (e) => {
    e.preventDefault();
    save();
  });
  Mousetrap.bind("mod+e", (e) => {
    e.preventDefault();
    toggleEdit();
  });
});

onUnmounted(() => {
  Mousetrap.unbind("mod+s");
  Mousetrap.unbind("mod+e");
});
</script>
