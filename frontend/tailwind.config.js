/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22C55E',
          glowing: '#4be277',
          dark: '#006e2f'
        },
        secondary: '#F59E0B',
        techblue: '#1E40AF',
        background: '#0b1326',
        surface: {
          DEFAULT: '#0b1326',
          dim: '#0b1326',
          bright: '#31394d',
          lowest: '#060e20',
          low: '#131b2e',
          container: '#171f33',
          high: '#222a3d',
          highest: '#2d3449'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
