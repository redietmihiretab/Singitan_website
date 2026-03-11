/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f7931e',
        secondary: '#ff8400',
        dark: '#000000',
        lightblack: '#111111',
        fontwhite: '#ffffff',
        glass: '#373737ff',
        glassText: '#636363ff',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'neon-pulse': 'neon 2s ease-in-out infinite alternate',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
