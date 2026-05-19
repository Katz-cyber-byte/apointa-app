/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A2540",
        electric: "#2F80FF",
        neon: "#00E5FF",
        soft: "#F7F9FC",
      },
    },
  },
  plugins: [],
};