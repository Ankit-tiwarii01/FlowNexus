/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        canvas: '#f7f8fc',
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#5457e5', 700: '#4338ca' },
      },
      boxShadow: { soft: '0 12px 38px rgba(17, 24, 39, 0.08)' },
    },
  },
  plugins: [],
};
