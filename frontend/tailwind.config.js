/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Refined emerald accent (the logo green, professionalised)
        boom: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Light, friendly surfaces (soft mint-tinted whites)
        night: {
          950: '#F4F8F5', // page background
          900: '#FFFFFF', // panels / cards
          850: '#EEF4EF', // subtle tiles
          800: '#E6EEE9',
          700: '#D6E1DA',
        },
        line: '#E3EBE5', // soft borders
        fg: '#0F1A14', // primary text (near-black green)
        mut: '#5A6A61', // muted text
        amber: '#C08A1E', // subtle secondary status accent (darker for light bg)
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-grotesk)', 'var(--font-inter)', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 10px 30px rgba(16, 24, 40, 0.06)',
        glow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 12px 40px rgba(16, 185, 129, 0.10)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        feedIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-9deg)' },
          '50%': { transform: 'rotate(9deg)' },
        },
        // Boomerang thrown out and returning, spinning the whole way
        'boomerang-fly': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(7rem, -2.5rem) rotate(540deg)' },
          '100%': { transform: 'translate(0, 0) rotate(1080deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(24px, -18px) scale(1.12)' },
          '66%': { transform: 'translate(-18px, 16px) scale(0.92)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        feedin: 'feedIn 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        'boomerang-fly': 'boomerang-fly 5.5s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
        pop: 'pop 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
