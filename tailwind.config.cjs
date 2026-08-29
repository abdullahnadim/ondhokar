/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ondhokar: {
          bg: "#F9F9F8", // Warm, editorial off-white
          text: "#171717", // Near-black for maximum readability
          muted: "#737373", // Secondary text
          border: "#E5E5E5", // Subtle borders
          outage: "#18181B", // Zinc-900 (Black) for scheduled load shedding
          available: "#E4E4E7", // Light gray indicating availability
          accent: "#D97706", // Restrained amber for 'NOW' indicator
        },
      },
      fontFamily: {
        // Inter for Latin, Noto Sans Bengali for Bangla support (ready for i18n)
        sans: ['var(--font-inter)', 'var(--font-noto-bengali)', 'sans-serif'],
      },
      boxShadow: {
        'utility': '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Extremely subtle, no floaty cards
      }
    },
  },
  plugins: [],
}