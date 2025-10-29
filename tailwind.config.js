const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", flowbite.content()],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [flowbite.plugin()],
};
