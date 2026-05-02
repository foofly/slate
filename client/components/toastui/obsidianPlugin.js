const CALLOUT_TYPES = ["note", "tip", "warning", "danger", "info", "success", "question", "abstract", "bug", "example", "quote", "okey", "error", "todo", "failure"];
const CALLOUT_ALIASES = {
  summary: "abstract", tldr: "abstract",
  hint: "tip", important: "tip",
  check: "success", done: "success",
  help: "question", faq: "question",
  caution: "warning", attention: "warning",
  cite: "quote",
  fail: "failure", missing: "failure",
};
const CALLOUT_ICONS = {
  note: "📝", tip: "💡", warning: "⚠️", danger: "🔥", info: "ℹ️",
  success: "✅", question: "❓", abstract: "📋", bug: "🐛", example: "📖", quote: "💬",
  okey: "✔️", error: "❌", todo: "☑️", failure: "✖️",
};

function getCalloutType(text) {
  const m = text.match(/^\[!(\w+)\]/i);
  if (!m) return null;
  const t = m[1].toLowerCase();
  if (CALLOUT_TYPES.includes(t)) return t;
  return CALLOUT_ALIASES[t] ?? null;
}

function blockQuoteFirstText(node) {
  const firstChild = node.firstChild;
  if (firstChild?.type === "paragraph") {
    const fc = firstChild.firstChild;
    if (fc) return fc.literal ?? "";
  }
  return "";
}

export function createObsidianRenderer(noteDir = "") {
  return buildRenderer(noteDir);
}

// Default export for contexts without a note path
export const obsidianCustomHTMLRenderer = buildRenderer("");

function buildRenderer(noteDir) { return {
  blockQuote(node, { entering, origin }) {
    const calloutType = getCalloutType(blockQuoteFirstText(node));
    if (!entering) {
      if (calloutType) {
        // Close callout-body then the outer callout div
        return [
          { type: "closeTag", tagName: "div" },
          { type: "closeTag", tagName: "div" },
        ];
      }
      return origin?.() ?? { type: "closeTag", tagName: "blockquote" };
    }
    if (calloutType) {
      return {
        type: "openTag",
        tagName: "div",
        attributes: { class: `callout callout-${calloutType}` },
        selfClose: false,
      };
    }
    return origin?.() ?? { type: "openTag", tagName: "blockquote", selfClose: false };
  },

  paragraph(node, { entering, origin }) {
    const parent = node.parent;
    if (parent?.type === "blockQuote" && parent.firstChild === node) {
      const fc = node.firstChild;
      const text = fc?.literal ?? "";
      const calloutType = getCalloutType(text);
      if (calloutType) {
        // On exit, emit nothing — callout-body is closed by blockQuote's exit handler
        if (!entering) return [];
        const icon = CALLOUT_ICONS[calloutType] ?? "";
        const label = calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
        const titleMatch = text.match(/^\[!\w+\]\s*(.*)/si);
        const titleExtra = titleMatch?.[1]?.trim() ?? "";
        const titleContent = titleExtra ? `${icon} ${label} — ${escapeHtml(titleExtra)}` : `${icon} ${label}`;
        return [
          { type: "openTag", tagName: "div", attributes: { class: "callout-title" }, selfClose: false },
          { type: "html", content: titleContent },
          { type: "closeTag", tagName: "div" },
          { type: "openTag", tagName: "div", attributes: { class: "callout-body" }, selfClose: false },
        ];
      }
    }
    return origin?.();
  },

  // Wikilinks and image embeds: post-process text nodes for [[...]] and ![[...]] patterns
  text(node, { origin }) {
    const literal = node.literal ?? "";
    // Suppress the [!TYPE] title text — already rendered in the callout-title div
    if (
      node.parent?.type === "paragraph" &&
      node.parent.parent?.type === "blockQuote" &&
      node.parent.parent.firstChild === node.parent &&
      node.parent.firstChild === node &&
      getCalloutType(literal)
    ) {
      return { type: "html", content: "" };
    }
    if (!literal.includes("[[")) return origin?.();

    const parts = [];
    let last = 0;
    const re = /(!?)\[\[([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(literal)) !== null) {
      if (m.index > last) {
        parts.push({ type: "html", content: escapeHtml(literal.slice(last, m.index)) });
      }
      const isEmbed = m[1] === "!";
      const target = m[2];
      if (isEmbed) {
        const resolved = (!target.includes("/") && noteDir) ? `${noteDir}/${target}` : target;
        const encodedPath = resolved.split("/").map(encodeURIComponent).join("/");
        parts.push({
          type: "html",
          content: `<img src="/api/attachments/${encodedPath}" alt="${escapeHtml(target)}" class="embedded-image">`,
        });
      } else {
        const href = `/note/${encodeURIComponent(target)}`;
        parts.push({ type: "html", content: `<a href="${href}" class="wiki-link">${escapeHtml(target)}</a>` });
      }
      last = m.index + m[0].length;
    }
    if (last < literal.length) {
      parts.push({ type: "html", content: escapeHtml(literal.slice(last)) });
    }
    return parts;
  },
}; }

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
