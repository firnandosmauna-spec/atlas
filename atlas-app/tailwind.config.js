/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          blue: '#1e3a8a',
          light: '#e0e7ff',
          accent: '#fbbf24',
          gray: '#f3f4f6',
          dark: '#1f2937'
        }
      }
    },
  },
  plugins: [],
}
