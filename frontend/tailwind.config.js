/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: "var(--color-border)",
        input: "var(--color-border-light)",
        background: "var(--color-surface)",
        foreground: "var(--color-text)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-text-secondary)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-bg-accent)",
          foreground: "var(--color-primary)",
        },
      },
    },
  },
  plugins: [],
}
