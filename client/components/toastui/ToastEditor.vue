<template>
  <div ref="editorEl" class="h-full" />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { Editor } from "@toast-ui/editor";
import mermaid from "mermaid";
import { baseOptions } from "./baseOptions.js";
import { createObsidianRenderer } from "./obsidianPlugin.js";
import "@toast-ui/editor/dist/toastui-editor.css";
import "./toastui-editor-overrides.scss";

const props = defineProps({
  modelValue: { type: String, default: "" },
  initialEditType: { type: String, default: "wysiwyg" },
  noteDir: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);
const editorEl = ref(null);
let editor = null;

async function renderMermaid() {
  await nextTick();
  // Only target the markdown preview pane, not the WYSIWYG editing area
  const preview = editorEl.value?.querySelector(".toastui-editor-md-preview");
  const nodes = preview?.querySelectorAll(".mermaid");
  if (nodes?.length) await mermaid.run({ nodes, suppressErrors: true });
}

onMounted(() => {
  editor = new Editor({
    el: editorEl.value,
    ...baseOptions,
    initialValue: props.modelValue,
    initialEditType: props.initialEditType,
    height: "100%",
    customHTMLRenderer: createObsidianRenderer(props.noteDir),
    events: {
      change: () => {
        const md = editor.getMarkdown();
        emit("update:modelValue", md);
        emit("change", md);
        renderMermaid();
      },
    },
  });
  renderMermaid();
});

onUnmounted(() => {
  editor?.destroy();
  editor = null;
});

watch(() => props.modelValue, (val) => {
  if (editor && val !== editor.getMarkdown()) {
    editor.setMarkdown(val);
  }
});

defineExpose({
  getMarkdown: () => editor?.getMarkdown() ?? "",
  setMarkdown: (md) => editor?.setMarkdown(md),
});
</script>
