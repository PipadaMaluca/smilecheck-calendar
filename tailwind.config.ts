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
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        premium: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "150ms",
        slow: "300ms",
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
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;