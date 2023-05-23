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
        "text-color": "var(--text-color)",
        "text-secondary-color": "var(--text-secondary-color)",
        "primary-color": "var(--primary-color)",
        "primary-color-text": "var(--primary-color-text)",
        "focus-ring": "var(--focus-ring)",
        "mask-bg": "var(--mask-bg)",
        "highlight-bg": "var(--highlight-bg)",
        "highlight-text-color": "var(--highlight-text-color)",
      }
    },
  },
  plugins: [
  ],
}
