/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",          // ✅ add this
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},              // ✅ add this
  },
  plugins: [],               // ✅ add this
}