/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-background': '#FFFFFF',
        'app-background': '#E0F2FE',
        'primary-ui': '#A5D8FF',
        'primary-text': '#1F2937',
        'secondary-text': '#6B7280',
        'accent': '#3B82F6',
      }
    },
  },
  plugins: [],
}
