/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      red: "#ffb3ba",
      orange: "#ffe4b2",
      green: "#6aaa64",
      yellow: "#c9b458",
      gray: "#787c7e",
      blue: "#d0f0fd",
      purple: "#cabdff",
      black: "#1c1c1c",
      white: "#ffffff",
      grey: "#333333",
    },
    fontFamily: {
      sans: ["Lato", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
