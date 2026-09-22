/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c0f',
        bg2: '#0f1318',
        bg3: '#141a20',
        panel: '#111620',
        border: '#1e2d20',
        border2: '#1a2b1c',
        green: {
          DEFAULT: '#00ff41',
          2: '#00cc33',
          dim: '#00ff4120',
          glow: '#00ff4140',
        },
        amber: '#ffb700',
        danger: '#ff3c3c',
        cyan: '#00e5ff',
        muted: '#4a6b4e',
        muted2: '#2e4a32',
        ink: '#c8e6c9',
        ink2: '#81a882',
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", 'monospace'],
        sans: ["'Rajdhani'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
