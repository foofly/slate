<template>
  <div ref="viewerEl" class="h-full toastui-viewer-wrap" />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import Viewer from "@toast-ui/editor/viewer";
import { basePlugins } from "./baseOptions.js";
import { obsidianCustomHTMLRenderer } from "./obsidianPlugin.js";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import "./toastui-editor-overrides.scss";

const props = defineProps({
  modelValue: { type: String, default: "" },
});

const viewerEl = ref(null);
let viewer = null;

onMounted(() => {
  viewer = new Viewer({
    el: viewerEl.value,
    initialValue: props.modelValue,
    plugins: basePlugins,
    customHTMLRenderer: obsidianCustomHTMLRenderer,
  });
});

onUnmounted(() => {
  viewer?.destroy();
  viewer = null;
});

watch(() => props.modelValue, (val) => {
  viewer?.setMarkdown(val);
});
</script>

<style scoped>
.toastui-viewer-wrap {
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--color-bg);
}
</style>
