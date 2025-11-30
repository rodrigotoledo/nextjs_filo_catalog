/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "matrix-green": "#00ff41",
        "matrix-dark": "#000000",
      },
      fontFamily: {
        mono: ['"Courier New"', "Orbitron", "monospace"],
      },
      animation: {
        glitch: "glitch 2s infinite",
      },
      keyframes: {
        glitch: {
          "0%,100%": { textShadow: "2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 4px 4px #0f0, -4px -4px #0ff" },
          "20%": { textShadow: "-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000, -4px -4px #0f0, 4px 4px #0ff" },
        },
      },
    },
  },
  plugins: [],
}
