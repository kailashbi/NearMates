/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#356AE6',
          hover: '#2952BD',
          light: '#EBF1FD'
        },
        navy: {
          DEFAULT: '#172B4D',
          dark: '#091E42',
          light: '#253858'
        },
        teal: {
          DEFAULT: '#17A398',
          light: '#E8F6F5'
        },
        orange: {
          accent: '#FF7A00',
          light: '#FFF4EB'
        },
        canvas: '#F5F7FB',
        surface: '#FFFFFF',
        slate: {
          border: '#EBECF0',
          muted: '#6B778C',
          subtle: '#8993A4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn: '10px'
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(23, 43, 77, 0.06), 0 1px 4px -1px rgba(23, 43, 77, 0.04)',
        cardHover: '0 12px 24px -6px rgba(23, 43, 77, 0.12), 0 4px 8px -2px rgba(23, 43, 77, 0.06)',
        dropdown: '0 8px 20px rgba(9, 30, 66, 0.12)'
      }
    },
  },
  plugins: [],
}

