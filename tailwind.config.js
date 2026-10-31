/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        plum: '#5E3474',
        magenta: '#C2185B',
        lavender: '#CEB6DA',
        ink: '#0B0B0B',
        paper: '#FAF9F8',
        peach: '#FBE6DB',
        travel: '#A08C8E',
        photography: '#546171',
        office: '#82A899',
        'brand-deep': '#5E3474',
        'brand-bright': '#C2185B',
        'brand-accent': '#E91E63',
        'primary-background': '#FFFFFF',
        'app-background': '#FAF9F8',
        'primary-text': '#0B0B0B',
        'secondary-text': '#6B7280',
        accent: '#E91E63',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 10px 24px rgba(30,18,28,0.10)',
        sheet: '0 -24px 70px rgba(24,12,22,0.28)',
      },
    },
  },
  plugins: [],
}
