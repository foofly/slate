<template>
  <div ref="viewerEl" class="h-full toastui-viewer-wrap" />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import Viewer from "@toast-ui/editor/viewer";
import mermaid from "mermaid";
import { basePlugins } from "./baseOptions.js";
import { createObsidianRenderer } from "./obsidianPlugin.js";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import "./toastui-editor-overrides.scss";

mermaid.initialize({ startOnLoad: false });

const props = defineProps({
  modelValue: { type: String, default: "" },
  noteDir: { type: String, default: "" },
});

const viewerEl = ref(null);
let viewer = null;

async function renderMermaid() {
  await nextTick();
  const nodes = viewerEl.value?.querySelectorAll(".mermaid");
  if (nodes?.length) await mermaid.run({ nodes, suppressErrors: true });
}

onMounted(() => {
  viewer = new Viewer({
    el: viewerEl.value,
    initialValue: props.modelValue,
    plugins: basePlugins,
    customHTMLRenderer: createObsidianRenderer(props.noteDir),
  });
  renderMermaid();
});

onUnmounted(() => {
  viewer?.destroy();
  viewer = null;
});

watch(() => props.modelValue, (val) => {
  viewer?.setMarkdown(val);
  renderMermaid();
});
</script>

<style scoped>
.toastui-viewer-wrap {
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--color-bg);
}
</style>
