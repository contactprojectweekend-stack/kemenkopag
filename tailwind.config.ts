import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5C3A21', // Coffee Brown
          dark: '#2B1B12',    // Espresso
        },
        cream: '#F7F1E8',
        coffeeBg: '#FCFAF7',
        accent: '#C98B5B',
      },
    },
  },
  plugins: [],
};
export default config;