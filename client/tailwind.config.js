/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:   "#3B82F6",
        secondary: "#8B5CF6",
        accent:    "#10B981",
        warning:   "#F59E0B",
        danger:    "#EF4444",
      },
      fontSize: {
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [],
};