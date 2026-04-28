const CALLOUT_TYPES = ["note", "tip", "warning", "danger", "info", "success", "question", "abstract", "bug", "example", "quote"];
const CALLOUT_ICONS = {
  note: "📝", tip: "💡", warning: "⚠️", danger: "🔥", info: "ℹ️",
  success: "✅", question: "❓", abstract: "📋", bug: "🐛", example: "📖", quote: "💬",
};

function getCalloutType(text) {
  const m = text.match(/^\[!(\w+)\]/i);
  if (!m) return null;
  const t = m[1].toLowerCase();
  return CALLOUT_TYPES.includes(t) ? t : null;
}

export const obsidianCustomHTMLRenderer = {
  blockQuote(node, { entering, origin }) {
    if (!entering) {
      return { type: "closeTag", tagName: "div" };
    }
    // Look at first child paragraph's first text node
    let firstText = "";
    const firstChild = node.firstChild;
    if (firstChild && firstChild.type === "paragraph") {
      const fc = firstChild.firstChild;
      if (fc) firstText = fc.literal ?? "";
    }
    const calloutType = getCalloutType(firstText);
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
    if (!entering) return origin?.();
    // Check if parent is a blockquote and this is the first paragraph (callout title)
    const parent = node.parent;
    if (parent?.type === "blockQuote" && parent.firstChild === node) {
      const fc = node.firstChild;
      const text = fc?.literal ?? "";
      const calloutType = getCalloutType(text);
      if (calloutType) {
        // Render callout title then suppress default paragraph — return multiple tokens
        const icon = CALLOUT_ICONS[calloutType] ?? "";
        const label = calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
        // Strip the [!TYPE] prefix from rendering
        return [
          { type: "openTag", tagName: "div", attributes: { class: "callout-title" }, selfClose: false },
          { type: "html", content: `${icon} ${label}` },
          { type: "closeTag", tagName: "div" },
          { type: "openTag", tagName: "div", attributes: { class: "callout-body" }, selfClose: false },
        ];
      }
    }
    return origin?.();
  },

  // Wikilinks: in Toast UI WYSIWYG, [[Note]] becomes a link with href=""
  // In the markdown source we post-process text nodes for [[...]] patterns
  text(node, { origin }) {
    const literal = node.literal ?? "";
    if (!literal.includes("[[")) return origin?.();

    const parts = [];
    let last = 0;
    const re = /\[\[([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(literal)) !== null) {
      if (m.index > last) {
        parts.push({ type: "html", content: escapeHtml(literal.slice(last, m.index)) });
      }
      const target = m[1];
      const href = `/note/${encodeURIComponent(target)}`;
      parts.push({ type: "html", content: `<a href="${href}" class="wiki-link">${escapeHtml(target)}</a>` });
      last = m.index + m[0].length;
    }
    if (last < literal.length) {
      parts.push({ type: "html", content: escapeHtml(literal.slice(last)) });
    }
    return parts;
  },
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
