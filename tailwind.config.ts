import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        concrete: "#F2F1ED",
        graphite: "#1C1F22",
        graphite2: "#2A2E33",
        steel: "#6B6F76",
        steelLight: "#B9BCC2",
        amber: {
          DEFAULT: "#E8A33D",
          dark: "#C8842A",
        },
        alert: "#C0392B",
        okgreen: "#3E7A4C",
        line: "#DDDAD1",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "hazard-stripe":
          "repeating-linear-gradient(45deg, #E8A33D, #E8A33D 10px, #1C1F22 10px, #1C1F22 20px)",
      },
    },
  },
  plugins: [],
};
export default config;
