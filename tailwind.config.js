/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          'dark-matter': '#4A5568',
          'gas': '#68D391',
          'dust': '#C69C6D',
          'energy': '#F6AD55',
          'stars': '#3182CE',
        },
      },
      animation: {
        'roll': 'roll 0.5s ease-in-out',
        'build': 'build 0.3s ease-out',
      },
      keyframes: {
        roll: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(90deg)' },
          '50%': { transform: 'rotate(180deg)' },
          '75%': { transform: 'rotate(270deg)' },
        },
        build: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
