import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto-kr)", "sans-serif"],
        jp: ["var(--font-noto-jp)", "sans-serif"],
      },
      animation: {
        "reveal-pop": "revealPop 0.45s ease-out forwards",
        "pulse-soft": "pulseSoft 1s ease-in-out infinite",
      },
      keyframes: {
        revealPop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
