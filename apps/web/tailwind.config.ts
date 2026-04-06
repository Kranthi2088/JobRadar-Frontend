import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EAF3FF",
          100: "#D6E8FF",
          200: "#AED2FF",
          300: "#84BBFF",
          400: "#5AA4FF",
          500: "#2997FF",
          600: "#0071E3",
          700: "#0066CC",
          800: "#004D99",
          900: "#003566",
        },
        surface: {
          DEFAULT: "#F5F5F7",
          raised: "#FFFFFF",
          bg: "#F5F5F7",
          dark: "#000000",
        },
        jr: {
          text1: "#1D1D1F",
          text2: "rgba(0,0,0,0.8)",
          text3: "rgba(0,0,0,0.48)",
          border: "rgba(0,0,0,0.08)",
          "border-strong": "rgba(0,0,0,0.14)",
          green: "#34C759",
          "green-light": "#F0FBF3",
          amber: "#FF9500",
          "amber-light": "#FFF8EC",
          red: "#FF3B30",
          accent: "#0071E3",
          "accent-light": "#EAF3FF",
          link: "#0066CC",
          "link-dark": "#2997FF",
          "dark-surface-1": "#272729",
          "dark-surface-2": "#262628",
          "dark-surface-3": "#28282A",
          "dark-surface-4": "#2A2A2D",
          "dark-surface-5": "#242426",
        },
      },
      fontFamily: {
        display: [
          "'SF Pro Display'",
          "-apple-system",
          "'Helvetica Neue'",
          "sans-serif",
        ],
        text: [
          "'SF Pro Text'",
          "-apple-system",
          "'Helvetica Neue'",
          "sans-serif",
        ],
        mono: [
          "'SF Mono'",
          "'Fira Code'",
          "'Cascadia Code'",
          "monospace",
        ],
      },
      borderRadius: {
        r1: "5px",
        r2: "8px",
        r3: "11px",
        r4: "18px",
        r5: "22px",
        pill: "980px",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-down": "fadeDown 0.35s ease",
        ring: "ring 0.6s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ring: {
          "0%": { transform: "scale(1)", opacity: "0.3" },
          "100%": { transform: "scale(3.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
