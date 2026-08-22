/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Named per the design plan — not generic "primary/secondary" so the
        // palette's intent stays legible in the code itself.
        basalt: { DEFAULT: '#1F2430', 800: '#262C3B', 700: '#2E3547' },
        laterite: { DEFAULT: '#B54834', 600: '#9C3C2A', 700: '#7F311F' },
        brass: { DEFAULT: '#C9A227', 600: '#AD8A20' },
        seafog: { DEFAULT: '#EDEFEA', 100: '#F5F6F3' },
        harbor: { DEFAULT: '#5B6472', 300: '#8A93A0', 200: '#B7BEC7' },
        chalk: '#F5F6F3',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      // The stepped-arch signature motif, expressed as a clip-path utility
      // so it can cut a corner on cards/buttons without needing an SVG per
      // instance. Named after what it IS (a deco step), not what it's for.
      clipPath: {
        decoStep: 'polygon(0 100%, 0 20px, 20px 20px, 20px 0, 100% 0, 100% 100%)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.clip-deco-step': {
          clipPath: 'polygon(0 100%, 0 20px, 20px 20px, 20px 0, 100% 0, 100% 100%)',
        },
      });
    },
  ],
};
