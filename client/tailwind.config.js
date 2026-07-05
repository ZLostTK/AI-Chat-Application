/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#60a5fa',
          500: '#3b82f6',
          DEFAULT: '#60a5fa',
        },
        surface: {
          DEFAULT: 'var(--color-bg-primary, #0f172a)',
          elevated: 'var(--color-bg-secondary, #1e293b)',
          card: 'var(--color-bg-elevated, #334155)',
          border: 'var(--color-border, #334155)',
        },
        border: {
          DEFAULT: 'var(--color-border, #334155)',
        },
        text: {
          primary: 'var(--color-text-primary, #f1f5f9)',
          secondary: 'var(--color-text-secondary, #cbd5e1)',
          muted: 'var(--color-text-muted, #94a3b8)',
        },
        semantic: {
          success: 'var(--color-success, #34d399)',
          error: 'var(--color-error, #f87171)',
          warning: 'var(--color-warning, #fbbf24)',
          info: 'var(--color-accent, #60a5fa)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        sm: '0.5rem',
      },
      boxShadow: {
        sm: 'var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.2))',
        md: 'var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4))',
        lg: 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5))',
      },
    },
  },
  plugins: [],
};
