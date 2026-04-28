/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/**/*.{vue,js,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        "bg-elevated": "var(--color-bg-elevated)",
        "bg-sidebar": "var(--color-bg-sidebar)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        brand: "var(--color-brand)",
        "brand-hover": "var(--color-brand-hover)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
