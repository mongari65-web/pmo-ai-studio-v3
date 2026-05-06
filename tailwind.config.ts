import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "sans-serif"] },
      colors: {
        border: "hsl(217 33% 16%)",
        input:  "hsl(217 33% 16%)",
        ring:   "hsl(221 83% 53%)",
        background: "hsl(222 47% 5%)",
        foreground: "hsl(210 40% 95%)",
        primary: { DEFAULT: "hsl(221 83% 53%)", foreground: "hsl(0 0% 100%)" },
        secondary: { DEFAULT: "hsl(217 33% 14%)", foreground: "hsl(210 40% 80%)" },
        muted: { DEFAULT: "hsl(217 33% 11%)", foreground: "hsl(215 20% 55%)" },
        accent: { DEFAULT: "hsl(217 33% 16%)", foreground: "hsl(210 40% 90%)" },
        destructive: { DEFAULT: "hsl(0 63% 55%)", foreground: "hsl(0 0% 100%)" },
        card: { DEFAULT: "hsl(222 47% 8%)", foreground: "hsl(210 40% 95%)" },
        pmo: {
          blue:   "#2563eb",
          purple: "#7c3aed",
          green:  "#059669",
          amber:  "#d97706",
          red:    "#dc2626",
          teal:   "#0891b2",
          navy:   "#0f172a",
          dark:   "#1e293b",
          darker: "#0a0f1a",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
}
export default config
