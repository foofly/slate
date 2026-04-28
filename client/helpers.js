export function encodeNotePath(path) {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export function decodeNotePath(path) {
  return path
    .split("/")
    .map((seg) => decodeURIComponent(seg))
    .join("/");
}

export function notePathToTitle(path) {
  const basename = path.split("/").pop() ?? path;
  return basename.replace(/\.md$/i, "");
}

export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function stripFrontmatter(content) {
  if (!content.startsWith("---")) return content;
  const end = content.indexOf("\n---", 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}
