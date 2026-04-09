/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./admin/**/*.{js,ts,jsx,tsx,mdx}", // Adicione esta linha especificamente
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}