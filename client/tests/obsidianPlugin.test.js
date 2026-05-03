/**
 * Tests for issues #5 (LaTeX) and #6 (mhchem) — math rendering via KaTeX.
 *
 * The obsidianPlugin renderer handles three math forms:
 *   - ```math code fences  → display block
 *   - $$...$$ in text      → display block
 *   - $...$  in text       → inline
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createObsidianRenderer } from "../components/toastui/obsidianPlugin.js";

let renderer;

beforeAll(() => {
  renderer = createObsidianRenderer();
});

// Helper: build a minimal text node with no blockquote parent so the
// callout-suppression guard doesn't fire.
function textNode(literal) {
  const node = {
    literal,
    parent: { type: "paragraph", firstChild: null, parent: { type: "root" } },
  };
  node.parent.firstChild = node;
  return node;
}

// --- Issue #5: LaTeX ---

describe("LaTeX rendering (issue #5)", () => {
  it("renders a ```math code fence as a display-mode KaTeX block", () => {
    const node = { info: "math", literal: "E = mc^2" };
    const result = renderer.codeBlock(node, { origin: () => null });

    expect(result.type).toBe("html");
    expect(result.content).toContain("math-display");
    expect(result.content).toContain("katex"); // KaTeX adds class="katex" to output
  });

  it("passes non-math code blocks through to origin", () => {
    let originCalled = false;
    const node = { info: "js", literal: "const x = 1;" };
    renderer.codeBlock(node, { origin: () => { originCalled = true; } });
    expect(originCalled).toBe(true);
  });

  it("renders $$...$$ as display-mode KaTeX", () => {
    const node = textNode("$$x^2 + y^2 = z^2$$");
    const parts = renderer.text(node, { origin: () => null });

    expect(Array.isArray(parts)).toBe(true);
    const mathPart = parts.find((p) => p.type === "html" && p.content.includes("katex"));
    expect(mathPart).toBeDefined();
    // Display mode wraps in an element with display style
    expect(mathPart.content).toContain("katex-display");
  });

  it("renders $...$ as inline KaTeX", () => {
    const node = textNode("Area is $\\pi r^2$ always.");
    const parts = renderer.text(node, { origin: () => null });

    expect(Array.isArray(parts)).toBe(true);
    const mathPart = parts.find((p) => p.type === "html" && p.content.includes("katex"));
    expect(mathPart).toBeDefined();
    // Inline mode should NOT have the katex-display wrapper
    expect(mathPart.content).not.toContain("katex-display");
  });

  it("preserves surrounding text when rendering inline math", () => {
    const node = textNode("Before $x$ after");
    const parts = renderer.text(node, { origin: () => null });

    const texts = parts.filter((p) => p.type === "html" && !p.content.includes("katex"));
    expect(texts.some((p) => p.content.includes("Before"))).toBe(true);
    expect(texts.some((p) => p.content.includes("after"))).toBe(true);
  });
});

// --- Issue #6: mhchem ---

describe("mhchem rendering (issue #6)", () => {
  it("renders \\ce{} chemistry notation inside inline math", () => {
    const node = textNode("Water is $\\ce{H2O}$.");
    const parts = renderer.text(node, { origin: () => null });

    expect(Array.isArray(parts)).toBe(true);
    const mathPart = parts.find((p) => p.type === "html" && p.content.includes("katex"));
    expect(mathPart).toBeDefined();
    // mhchem renders H2O — the subscript 2 should appear in the output
    expect(mathPart.content).toMatch(/H.*2.*O/s);
  });

  it("renders \\ce{} in a ```math code fence", () => {
    const node = { info: "math", literal: "\\ce{H2SO4}" };
    const result = renderer.codeBlock(node, { origin: () => null });

    expect(result.type).toBe("html");
    expect(result.content).toContain("katex");
    expect(result.content).toMatch(/H.*S.*O/s);
  });
});
