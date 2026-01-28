/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}", // Include ui-kit
    ],
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--color-border))",
          matcha: {
            "50": "#f5f7fa",
            "100": "#e4e7eb",
            "200": "#cbd0d9",
            "300": "#a6aebf",
            "400": "#7b879e",
            "500": "#5b6882",
            "600": "#465066",
            "700": "#394152",
            "800": "#313642",
            "900": "#2a2d36",
            "950": "#1a1c22"
          },
          input: "hsl(var(--color-input))",
          ring: "hsl(var(--color-ring))",
          background: "hsl(var(--color-background))",
          foreground: "hsl(var(--color-foreground))",
          primary: {
            DEFAULT: "hsl(var(--color-primary))",
            foreground: "hsl(var(--color-primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--color-secondary))",
            foreground: "hsl(var(--color-secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--color-destructive))",
            foreground: "hsl(var(--color-destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--color-muted))",
            foreground: "hsl(var(--color-muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--color-accent))",
            foreground: "hsl(var(--color-accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--color-popover))",
            foreground: "hsl(var(--color-popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--color-card))",
            foreground: "hsl(var(--color-card-foreground))",
          },
          surface: {
            DEFAULT: "hsl(var(--color-surface))",
            elevated: "hsl(var(--color-surface-elevated))",
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
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  }
