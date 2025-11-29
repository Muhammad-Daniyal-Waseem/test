/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'contech-blue': '#2563EB',
        'contech-orange': '#F77F00',
        'contech-navy': '#1E3A5F',
      },
    },
  },
  plugins: [],
};
