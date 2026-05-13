/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        td: {
          indigo: '#6366f1',
          'indigo-soft': 'rgba(99,102,241,0.08)',
          dark: '#020818',
          'dark-2': '#0d0b22',
          'surface': 'rgba(255,255,255,0.03)',
          'surface-hover': 'rgba(255,255,255,0.06)',
          muted: '#8890b0',
          'muted-dark': '#3d4468',
          'muted-darker': '#5a6080',
          foreground: '#e2e2f0',
          'foreground-muted': '#c8d0f0',
        },
      },
      fontFamily: {
        display: ["'Syne'", 'sans-serif'],
        body: ["'Inter'", 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'spin-slow': 'spin 1s linear infinite',
        'scan': 'scan 1.8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          'from': { top: '0' },
          'to': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}
