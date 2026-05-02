import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";
import Prism from "prismjs";
import katexPlugin from "@toast-ui/editor-plugin-katex";
import "@toast-ui/editor-plugin-katex/dist/toastui-editor-plugin-katex.css";
import "katex/contrib/mhchem";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";

export const basePlugins = [[codeSyntaxHighlight, { highlighter: Prism }], katexPlugin];

export const baseOptions = {
  usageStatistics: false,
  frontMatter: true,
  plugins: basePlugins,
  toolbarItems: [
    ["heading", "bold", "italic", "strike"],
    ["hr", "quote"],
    ["ul", "ol", "task", "indent", "outdent"],
    ["table", "link"],
    ["code", "codeblock"],
  ],
};
