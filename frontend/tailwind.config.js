/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxe: {
          gold: '#D4AF37',
          dark: '#111827',
          panel: '#1F2937'
        }
      }
    },
  },
  plugins: [],
}
