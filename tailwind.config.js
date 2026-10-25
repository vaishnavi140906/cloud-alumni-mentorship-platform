/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0ECFF',
          100: '#EAF1FF',
          200: '#D6E4FF',
          300: '#B0CAFF',
          400: '#8AA7F8',
          500: '#647FE8', // primary accent
          600: '#4D68D9',
          700: '#3850B8',
          800: '#2A3C91',
          900: '#1F2C6D',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          border: '#E2E8F0',
          text: '#263247',
          muted: '#64748B',
        },
        accent: {
          blue: '#EAF1FF',
          lavender: '#F0ECFF',
          teal: '#DDF7F0',
          50: '#F0ECFF',
          100: '#EAF1FF',
          200: '#D6E4FF',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(100, 127, 232, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(100, 127, 232, 0.16), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'panel': '0 4px 20px -2px rgba(100, 127, 232, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glow-brand': '0 0 20px -3px rgba(100, 127, 232, 0.35)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.88' },
        }
      }
    },
  },
  plugins: [],
}
