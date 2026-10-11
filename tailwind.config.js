/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        fun: ['"Baloo 2"', '"Comic Sans MS"', '"Chalkboard SE"', '"Arial Rounded MT Bold"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
