import { ref } from "vue";
import { themes } from "./themes.js";

const STORAGE_KEY = "slate-theme";
const activeThemeId = ref(localStorage.getItem(STORAGE_KEY) || themes[0].id);

function applyTheme(id) {
  const theme = themes.find((t) => t.id === id) ?? themes[0];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--color-${key}`, value);
  }
  activeThemeId.value = theme.id;
  localStorage.setItem(STORAGE_KEY, theme.id);
}

applyTheme(activeThemeId.value);

export function useTheme() {
  return { themes, activeThemeId, applyTheme };
}
