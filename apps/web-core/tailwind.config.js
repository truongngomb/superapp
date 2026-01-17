/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS variable-based theming for easy customization
        primary: {
          50: 'hsl(var(--color-primary-50) / <alpha-value>)',
          100: 'hsl(var(--color-primary-100) / <alpha-value>)',
          200: 'hsl(var(--color-primary-200) / <alpha-value>)',
          300: 'hsl(var(--color-primary-300) / <alpha-value>)',
          400: 'hsl(var(--color-primary-400) / <alpha-value>)',
          500: 'hsl(var(--color-primary-500) / <alpha-value>)',
          600: 'hsl(var(--color-primary-600) / <alpha-value>)',
          700: 'hsl(var(--color-primary-700) / <alpha-value>)',
          800: 'hsl(var(--color-primary-800) / <alpha-value>)',
          900: 'hsl(var(--color-primary-900) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
        },
        secondary: {
          50: 'hsl(var(--color-secondary-50) / <alpha-value>)',
          100: 'hsl(var(--color-secondary-100) / <alpha-value>)',
          200: 'hsl(var(--color-secondary-200) / <alpha-value>)',
          300: 'hsl(var(--color-secondary-300) / <alpha-value>)',
          400: 'hsl(var(--color-secondary-400) / <alpha-value>)',
          500: 'hsl(var(--color-secondary-500) / <alpha-value>)',
          600: 'hsl(var(--color-secondary-600) / <alpha-value>)',
          700: 'hsl(var(--color-secondary-700) / <alpha-value>)',
          800: 'hsl(var(--color-secondary-800) / <alpha-value>)',
          900: 'hsl(var(--color-secondary-900) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
        },
        accent: {
          50: 'hsl(var(--color-accent-50) / <alpha-value>)',
          100: 'hsl(var(--color-accent-100) / <alpha-value>)',
          200: 'hsl(var(--color-accent-200) / <alpha-value>)',
          300: 'hsl(var(--color-accent-300) / <alpha-value>)',
          400: 'hsl(var(--color-accent-400) / <alpha-value>)',
          500: 'hsl(var(--color-accent-500) / <alpha-value>)',
          600: 'hsl(var(--color-accent-600) / <alpha-value>)',
          700: 'hsl(var(--color-accent-700) / <alpha-value>)',
          800: 'hsl(var(--color-accent-800) / <alpha-value>)',
          900: 'hsl(var(--color-accent-900) / <alpha-value>)',
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'hsl(var(--color-surface) / <alpha-value>)',
          elevated: 'hsl(var(--color-surface-elevated) / <alpha-value>)',
        },
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
