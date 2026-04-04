/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0d14',
          900: '#0f1117',
          800: '#161b27',
          700: '#1e2535',
        },
        accent: {
          DEFAULT: '#7c6ff7',
          light: '#a89af9',
          dark: '#5a4fd6',
        },
        mood: {
          happy: '#f59e0b',
          sad: '#3b82f6',
          excited: '#f97316',
          anxious: '#ef4444',
          relaxed: '#22c55e',
          bored: '#6b7280',
          romantic: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
