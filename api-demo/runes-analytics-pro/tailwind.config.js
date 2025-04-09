/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // Adicione aqui as cores e fontes do tema neural, se desejar
      // Exemplo:
      // colors: {
      //   'neural-primary': '#5ce1e6',
      //   'neural-secondary': '#9d4edd',
      //   'neural-bg': '#0a0a1a',
      // },
      // fontFamily: {
      //   sans: ['Rajdhani', 'sans-serif'],
      // },
    },
  },
  plugins: [],
} 