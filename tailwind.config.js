/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hind Siliguri', 'sans-serif'],
      },
      colors: {
        primary: '#1565C0', // Deep Royal Blue (Logo Main Color)
        secondary: '#0288D1', // Bright Blue/Cyan (Accent)
        accent: '#E3F2FD', // Very Light Blue (Backgrounds)
        dark: '#0D47A1', // Darker Blue for hover states
      }
    },
  },
  plugins: [],
}