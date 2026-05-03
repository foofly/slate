<template>
  <div>
    <!-- Folder -->
    <div
      v-if="node.type === 'folder'"
      class="flex items-center gap-1.5 px-3 py-1 cursor-pointer select-none text-sm transition-colors"
      :class="{ 'drag-over-folder': dragOver }"
      style="color: var(--color-text-muted)"
      :style="{ paddingLeft: `${(depth * 12) + 12}px` }"
      @click="isOpen = !isOpen"
      @contextmenu.prevent="openContextMenu"
      draggable="true"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      @dragover.prevent="onFolderDragOver"
      @dragleave="onFolderDragLeave"
      @drop.prevent="onFolderDrop"
    >
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        :style="{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }"
      ><path d="m9 18 6-6-6-6"/></svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="truncate">{{ node.name }}</span>
    </div>
    <!-- Folder children -->
    <div v-if="node.type === 'folder' && isOpen">
      <TreeNode v-for="child in node.children" :key="child.path" :node="child" :depth="depth + 1" />
    </div>
    <!-- File -->
    <div
      v-if="node.type === 'file'"
      class="flex items-center gap-1.5 px-3 py-1 cursor-pointer select-none text-sm transition-colors rounded mx-1"
      :class="isActive ? 'font-medium' : 'hover:bg-opacity-10'"
      :style="{
        paddingLeft: `${(depth * 12) + 12}px`,
        background: isActive ? 'var(--color-brand)' + '22' : '',
        color: isActive ? 'var(--color-brand)' : 'var(--color-text)',
      }"
      draggable="true"
      @click="openNote"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="truncate">{{ title }}</span>
    </div>

    <!-- Context menu -->
    <Teleport to="body">
      <div
        v-if="showMenu"
        class="fixed z-50 rounded-lg shadow-xl py-1"
        style="background: var(--color-bg-elevated); border: 1px solid var(--color-border); min-width: 180px"
        :style="{ left: menuX + 'px', top: menuY + 'px' }"
        @click.stop
      >
        <button class="context-menu-item" @click="openNewNoteHere">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          New Note Here
        </button>
        <button class="context-menu-item" @click="openNewSubfolderHere">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          New Subfolder
        </button>
        <div class="context-menu-divider" />
        <button class="context-menu-item" @click="openRename">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Rename
        </button>
        <button class="context-menu-item" @click="openMove">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
          Move
        </button>
        <div class="context-menu-divider" />
        <button class="context-menu-item context-menu-item--danger" @click="openDelete">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Delete
        </button>
      </div>
    </Teleport>

    <!-- Modals -->
    <NewNoteModal v-if="showNewNote" :parentPath="node.path" @close="showNewNote = false" />
    <NewFolderModal v-if="showNewSubfolder" :parentPath="node.path" @close="showNewSubfolder = false" />
    <RenameFolderModal v-if="showRename" :folderPath="node.path" @close="showRename = false" />
    <MoveFolderModal v-if="showMove" :folderPath="node.path" @close="showMove = false" />
    <ConfirmModal
      v-if="showDelete"
      :message="`Delete '${node.name}' and all its contents? This cannot be undone.`"
      confirmLabel="Delete"
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useVaultStore } from "../store.js";
import { moveNote, moveFolder, deleteFolder } from "../api.js";
import { notePathToTitle } from "../helpers.js";
import NewNoteModal from "./NewNoteModal.vue";
import NewFolderModal from "./NewFolderModal.vue";
import RenameFolderModal from "./RenameFolderModal.vue";
import MoveFolderModal from "./MoveFolderModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
});

const isOpen = ref(false);
const dragOver = ref(false);
const store = useVaultStore();
const router = useRouter();

const isActive = computed(() => store.activeNotePath === props.node.path);
const title = computed(() => notePathToTitle(props.node.name));

// Context menu state
const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const showNewNote = ref(false);
const showNewSubfolder = ref(false);
const showRename = ref(false);
const showMove = ref(false);
const showDelete = ref(false);

function openContextMenu(e) {
  menuX.value = e.clientX;
  menuY.value = e.clientY;
  showMenu.value = true;
}

function closeMenu() {
  showMenu.value = false;
}

function openNewNoteHere() { closeMenu(); showNewNote.value = true; }
function openNewSubfolderHere() { closeMenu(); showNewSubfolder.value = true; }
function openRename() { closeMenu(); showRename.value = true; }
function openMove() { closeMenu(); showMove.value = true; }
function openDelete() { closeMenu(); showDelete.value = true; }

async function confirmDelete() {
  showDelete.value = false;
  try {
    await deleteFolder(props.node.path);
    if (store.activeNotePath?.startsWith(props.node.path + "/")) {
      store.setActiveNote(null);
      router.push("/");
    }
    await store.fetchTree();
  } catch (err) { console.error("Delete folder failed:", err); }
}

onMounted(() => document.addEventListener("click", closeMenu));
onUnmounted(() => document.removeEventListener("click", closeMenu));

function openNote() {
  const notePath = props.node.path.replace(/\.md$/i, "");
  store.setActiveNote(props.node.path);
  router.push(`/note/${notePath}`);
}

function onDragStart(e) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", props.node.path);
  e.currentTarget.style.opacity = "0.4";
}

function onDragEnd(e) {
  e.currentTarget.style.opacity = "";
}

function onFolderDragOver(e) {
  e.dataTransfer.dropEffect = "move";
  dragOver.value = true;
}

function onFolderDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) dragOver.value = false;
}

async function onFolderDrop(e) {
  dragOver.value = false;
  const draggedPath = e.dataTransfer.getData("text/plain");
  if (!draggedPath) return;

  if (draggedPath.endsWith(".md")) {
    const fileName = draggedPath.split("/").pop();
    const newPath = `${props.node.path}/${fileName}`;
    const currentParent = draggedPath.includes("/") ? draggedPath.slice(0, draggedPath.lastIndexOf("/")) : "";
    if (currentParent === props.node.path) return;
    if (store.isDirty && store.activeNotePath === draggedPath)
      if (!confirm("Unsaved changes — move anyway?")) return;
    try {
      await moveNote(draggedPath, newPath);
      if (store.activeNotePath === draggedPath) {
        store.setActiveNote(newPath);
        router.push(`/note/${newPath.replace(/\.md$/i, "")}`);
      }
      isOpen.value = true;
      await store.fetchTree();
    } catch (err) { console.error("Move failed:", err); }

  } else {
    if (draggedPath === props.node.path) return;
    if (props.node.path.startsWith(draggedPath + "/")) return;
    const currentParent = draggedPath.includes("/") ? draggedPath.slice(0, draggedPath.lastIndexOf("/")) : "";
    if (currentParent === props.node.path) return;
    const folderName = draggedPath.split("/").pop();
    const newPath = `${props.node.path}/${folderName}`;
    try {
      await moveFolder(draggedPath, newPath);
      if (store.activeNotePath?.startsWith(draggedPath + "/")) {
        const updated = newPath + store.activeNotePath.slice(draggedPath.length);
        store.setActiveNote(updated);
        router.push(`/note/${updated.replace(/\.md$/i, "")}`);
      }
      isOpen.value = true;
      await store.fetchTree();
    } catch (err) { console.error("Folder move failed:", err); }
  }
}
</script>

<style scoped>
[draggable="true"] { cursor: grab; }
.drag-over-folder {
  background: color-mix(in srgb, var(--color-brand) 15%, transparent);
  border-radius: 4px;
  outline: 1px dashed var(--color-brand);
  outline-offset: -1px;
}
.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  font-size: 13px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  transition: background 0.1s;
}
.context-menu-item:hover {
  background: color-mix(in srgb, var(--color-brand) 12%, transparent);
}
.context-menu-item--danger { color: #f38ba8; }
.context-menu-item--danger:hover { background: color-mix(in srgb, #f38ba8 12%, transparent); }
.context-menu-divider {
  height: 1px;
  margin: 4px 0;
  background: var(--color-border);
}
</style>
