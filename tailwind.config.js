/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E2A78',
          light: '#2E3E9A',
          dark: '#151D5A',
        },
        // Rampa da marca: "blue-*" renderiza a escala do Índigo Vespertino (#1E2A78).
        // NÃO use azuis de sistema (ex.: #007AFF) — veja DESIGN.md.
        blue: {
          50: '#EEF1FB',
          100: '#DCE3F8',
          200: '#BCC7F0',
          300: '#93A5EC',
          400: '#6C84DF',
          500: '#4761C8',
          600: '#2E3E9A',
          700: '#25317D',
          800: '#1E2A78',
          900: '#171F55',
        },
        surface: '#F4F5F8',
        card: '#FFFFFF',
        'text-muted': '#6B7280',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        dark: {
          surface: '#1A1A1A',
          card: '#2D2D2D',
          'text-muted': '#9CA3AF',
          primary: {
            DEFAULT: '#93A5EC',
            light: '#BCC7F0',
            dark: '#6C84DF',
          },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-down-out': 'slideDownOut 0.4s ease-in forwards',
        'slide-right': 'slideRight 0.3s ease-out forwards',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDownOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
