/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/render/**/*.{js,ts,jsx,tsx}",
    "./src/render/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b46c1',
          900: '#581c87',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'gradient-primary': 'linear-gradient(135deg, #667eea, #764ba2)',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'primary': '0 4px 16px rgba(102, 126, 234, 0.3)',
      }
    },
  },
  plugins: [],
}
