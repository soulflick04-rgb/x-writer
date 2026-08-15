/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#07080B',
          900: '#0C0E14',
          850: '#11141D',
          800: '#171B26',
          750: '#1E2332',
          700: '#272E40',
          600: '#3A445C',
          500: '#526080',
          400: '#7C8BA6',
          300: '#A6B4CC',
          200: '#CBD5E1',
          100: '#E2E8F0',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          glow: 'rgba(245, 158, 11, 0.18)',
        },
        lens: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          glow: 'rgba(14, 165, 233, 0.18)',
        },
        spicy: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
        verify: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Cabinet Grotesk"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'cinema-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'cinema-glow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'lens-glow': '0 0 25px -5px rgba(14, 165, 233, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
