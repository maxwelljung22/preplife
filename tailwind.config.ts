import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans:    ["var(--font-body)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.serif],
        mono:    ["var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        crimson: {
          DEFAULT: "#8B1A1A",
          50:  "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          400: "#ff6b6b",
          600: "#c11313",
          700: "#9f1414",
          800: "#841717",
          900: "#480707",
        },
        navy: {
          DEFAULT: "#0E1B2C",
          50:  "#eff4fb",
          100: "#dce6f5",
          600: "#294894",
          700: "#273d79",
          800: "#253564",
        },
        gold: {
          DEFAULT: "#9A7C2E",
          light: "#C9A84C",
          dim: "rgba(154,124,46,0.10)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border:  "hsl(var(--border))",
        input:   "hsl(var(--input))",
        ring:    "hsl(var(--ring))",
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        "card":          "0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)",
        "card-hover":    "0 4px 16px rgba(0,0,0,0.07), 0 12px 40px rgba(0,0,0,0.06)",
        "glow-crimson":  "0 0 0 3px rgba(139,26,26,0.13)",
        "modal":         "0 20px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
      },
      keyframes: {
        "accordion-down":  { from: { height: "0" },    to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":    { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in":         { from: { opacity: "0" },   to: { opacity: "1" } },
        "fade-up":         { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        "scale-in":        { from: { opacity: "0", transform: "scale(0.94)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-in-right":  { from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in":         "fade-in 0.3s ease-out both",
        "fade-up":         "fade-up 0.4s ease-out both",
        "scale-in":        "scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-in-right":  "slide-in-right 0.35s ease-out both",
      },
    },
  },
  plugins: [animate],
};

export default config;
