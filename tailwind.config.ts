import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#07111f",
          900: "#0b1630",
          800: "#13264a",
        },
        ptl: {
          root: "var(--ptl-bg-root)",
          deep: "var(--ptl-bg-deep)",
          panel: "rgb(16 33 57 / <alpha-value>)",
          cyan: "var(--ptl-cyan)",
          violet: "var(--ptl-violet)",
          success: "var(--ptl-success)",
          warning: "var(--ptl-warning)",
          danger: "var(--ptl-danger)",
          info: "var(--ptl-info)",
          primary: "var(--ptl-text-primary)",
          secondary: "var(--ptl-text-secondary)",
          muted: "var(--ptl-text-muted)",
        },
      },
      boxShadow: {
        glow: "0 24px 90px rgba(85, 214, 255, 0.16)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
