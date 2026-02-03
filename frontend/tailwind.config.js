/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4f4',
          100: '#cceaea',
          200: '#99d4d5',
          300: '#66bfc0',
          400: '#33a9ab',
          500: '#0e888d',
          600: '#0b6d71',
          700: '#085255',
          800: '#053638',
          900: '#031b1c',
        },
        secondary: {
          50: '#fef8eb',
          100: '#fef1d7',
          200: '#fde3af',
          300: '#fcd587',
          400: '#fbc75f',
          500: '#fea629',
          600: '#cb8521',
          700: '#986419',
          800: '#654210',
          900: '#332108',
        },
        dark: {
          DEFAULT: '#415861',
          50: '#ebedef',
          100: '#d7dbde',
          200: '#afb7bd',
          300: '#87939c',
          400: '#5f6f7b',
          500: '#415861',
          600: '#34464d',
          700: '#27353a',
          800: '#1a2326',
          900: '#0d1213',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Avenir', 'Avenir Next', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'container': '1440px',
      },
    },
  },
  plugins: [],
}
