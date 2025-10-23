/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <-- enable manual dark mode control
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
