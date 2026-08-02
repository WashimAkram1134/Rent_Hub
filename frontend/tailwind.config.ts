import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── RentHub Brand Palette ─────────────────────────────────────────
        brand: {
          50:  "hsl(220, 100%, 97%)",
          100: "hsl(220, 95%, 93%)",
          200: "hsl(220, 90%, 85%)",
          300: "hsl(220, 85%, 75%)",
          400: "hsl(220, 80%, 63%)",
          500: "hsl(220, 75%, 52%)",   // Primary
          600: "hsl(220, 80%, 44%)",
          700: "hsl(220, 85%, 36%)",
          800: "hsl(220, 88%, 28%)",
          900: "hsl(220, 90%, 20%)",
          950: "hsl(220, 92%, 13%)",
        },
        accent: {
          50:  "hsl(32, 100%, 97%)",
          100: "hsl(32, 95%, 92%)",
          300: "hsl(32, 90%, 72%)",
          400: "hsl(32, 88%, 60%)",
          500: "hsl(32, 85%, 50%)",   // Orange accent
          600: "hsl(32, 88%, 42%)",
        },
        // shadcn/ui CSS variable tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent_ui: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.5)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, hsl(220, 92%, 13%) 0%, hsl(220, 80%, 22%) 40%, hsl(240, 70%, 28%) 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
      },
      boxShadow: {
        "brand": "0 4px 24px -4px rgba(59, 100, 240, 0.35)",
        "card-hover": "0 20px 60px -12px rgba(0, 0, 0, 0.3)",
        "glow": "0 0 40px rgba(59, 130, 246, 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
