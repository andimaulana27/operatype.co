/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#C8705C',
        'brand-orange-hover': '#FF7C5E',
        'brand-black': '#3f3f3f',
        'brand-white': '#F9F9F9',
        'brand-gray-1': '#9C9C9C',
        'brand-gray-2': '#F2F2F2',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}