import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        gaming: ['Russo One', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          surface: "hsl(var(--warning-surface))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Consultation type colors
        restauracao: "hsl(var(--restauracao))",
        "primeira-consulta": "hsl(var(--primeira-consulta))",
        protese: "hsl(var(--protese))",
        urgencia: "hsl(var(--urgencia))",
        teleconsulta: "hsl(var(--teleconsulta))",
        bloqueado: "hsl(var(--bloqueado))",
        livre: "hsl(var(--livre))",
        // Legacy compatibility
        presencial: "hsl(var(--presencial))",
        urgente: "hsl(var(--urgente))",
        prioritario: "hsl(var(--prioritario))",
        rotina: "hsl(var(--rotina))",
        gaming: {
          dark: "hsl(var(--gaming-dark))",
          darker: "hsl(var(--gaming-darker))",
          card: "hsl(var(--gaming-card))",
          green: "hsl(var(--gaming-green))",
          gold: "hsl(var(--gaming-gold))",
          orange: "hsl(var(--gaming-orange))",
          red: "hsl(var(--gaming-red))",
          purple: "hsl(var(--gaming-purple))",
          diamond: "hsl(var(--gaming-diamond))",
          platinum: "hsl(var(--gaming-platinum))",
        },
        level: {
          can: "hsl(var(--level-can))",
          bronze: "hsl(var(--level-bronze))",
          silver: "hsl(var(--level-silver))",
          gold: "hsl(var(--level-gold))",
          platinum: "hsl(var(--level-platinum))",
          diamond: "hsl(var(--level-diamond))",
          adamantine: "hsl(var(--level-adamantine))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(207 90% 54% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(207 90% 54% / 0.5)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "points-float": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-40px)" },
        },
        "achievement-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "star-pop": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "40%": { transform: "scale(1.3) rotate(15deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "fire-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "status-pulse": {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "points-float": "points-float 1.5s ease-out forwards",
        "achievement-pop": "achievement-pop 300ms ease-out",
        "star-pop": "star-pop 400ms ease-out",
        "fire-flicker": "fire-flicker 1.2s ease-in-out infinite",
        "status-pulse": "status-pulse 600ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;