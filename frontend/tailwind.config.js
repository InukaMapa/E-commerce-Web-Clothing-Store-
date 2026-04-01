/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      colors: {
        primary: "#000000",
        secondary: "#FFFFFF",
        accent: "#1A1A1A",
        muted: "#F5F5F5",
      },
      letterSpacing: {
        widest: ".2em",
      },
    },
  },
  plugins: [],
}
