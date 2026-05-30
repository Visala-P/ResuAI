/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        115: "28.75rem",
        120: "30rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        slate: {
          550: "#5f6f86",
          650: "#475569",
          750: "#334155",
        },
        rose: {
          650: "#be123c",
        },
      },
    },
  },
  plugins: [],
};