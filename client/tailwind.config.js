/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#00f2ff",
        "background-light": "#f5f8f8",
        "background-dark": "#0B0E14",
        "matrix-green": "#00FF41",
        "surface-dark": "#162a2b",
      },
      fontFamily: {
        "display": ["Rajdhani", "Space Grotesk", "sans-serif"],
        "body": ["Space Grotesk", "sans-serif"],
        "mono": ["Space Mono", "monospace"],
      },
      backgroundImage: {
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L20 10 L20 20 L30 20 M50 50 L60 50 L60 60 L80 60 M10 80 L30 80 L30 60' stroke='%2300f2ff' stroke-width='1' fill='none' opacity='0.05'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%2300f2ff' opacity='0.05'/%3E%3Ccircle cx='60' cy='60' r='2' fill='%2300f2ff' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
      boxShadow: {
        'neon': '0 0 10px rgba(0, 242, 255, 0.3), 0 0 20px rgba(0, 242, 255, 0.1)',
        'neon-green': '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px #00f2ff, 0 0 20px #00f2ff' },
          '50%': { boxShadow: '0 0 20px #00f2ff, 0 0 40px #00f2ff' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
