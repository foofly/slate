<template>
  <div ref="editorEl" class="h-full" />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Editor } from "@toast-ui/editor";
import { baseOptions } from "./baseOptions.js";
import { obsidianCustomHTMLRenderer } from "./obsidianPlugin.js";
import "@toast-ui/editor/dist/toastui-editor.css";
import "./toastui-editor-overrides.scss";

const props = defineProps({
  modelValue: { type: String, default: "" },
  initialEditType: { type: String, default: "wysiwyg" },
});

const emit = defineEmits(["update:modelValue", "change"]);
const editorEl = ref(null);
let editor = null;

onMounted(() => {
  editor = new Editor({
    el: editorEl.value,
    ...baseOptions,
    initialValue: props.modelValue,
    initialEditType: props.initialEditType,
    height: "100%",
    customHTMLRenderer: obsidianCustomHTMLRenderer,
    events: {
      change: () => {
        const md = editor.getMarkdown();
        emit("update:modelValue", md);
        emit("change", md);
      },
    },
  });
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
