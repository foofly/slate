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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useVaultStore } from "../store.js";
import { moveNote, moveFolder } from "../api.js";
import { notePathToTitle } from "../helpers.js";

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
</style>
