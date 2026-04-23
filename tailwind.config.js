/** @type {import('tailwindcss').Config} */
export default {
  // Scan all JSX / JS files inside src/ for class names
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#263238",
        card:       "#455A64",
        gold:       "#D4AF37",
        cta:        "#FFD700",
        textWhite:  "#FFFFFF",
      },
      fontFamily: {
        // Exposes the Tajawal font as class: font-tajawal
        tajawal: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
};
