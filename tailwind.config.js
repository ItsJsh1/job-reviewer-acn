/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14121F",
        paper: "#FAFAF9",
        violet: {
          DEFAULT: "#7B2FF7",
          dim: "#5A1FB8",
          tint: "#F1E7FE",
        },
        teal: {
          DEFAULT: "#00C2A8",
          tint: "#DFF9F4",
        },
        slate: {
          DEFAULT: "#6B7280",
          light: "#D8D8DE",
        },
        amber: {
          DEFAULT: "#F5A524",
          tint: "#FDF1DC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
