/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36adf6',
          500: '#0c93e7',
          600: '#0074c5',
          700: '#015c9f',
          800: '#064e83',
          900: '#0b416d',
          950: '#072a49',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a2e',
        },
        muted: {
          light: '#f5f5f7',
          dark: '#16213e',
        },
      },
      fontFamily: {
        sans: [
          'IBM Plex Sans Arabic',
          'IBM Plex Sans',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      spacing: {
        sidebar: '260px',
      },
    },
  },
  plugins: [],
};
