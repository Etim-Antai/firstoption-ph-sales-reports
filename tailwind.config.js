/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#10243A',
          'navy-dark': '#0B192C',
          'navy-light': '#1C3550',
          teal: '#0D9488',
          'teal-light': '#14B8A6',
          'teal-dark': '#0F766E',
          sky: '#60A5FA',
          'sky-light': '#93C5FD',
          bg: '#F5F7FA',
          dark: '#1F2937',
          muted: '#6B7280',
          border: '#E6EAF0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
