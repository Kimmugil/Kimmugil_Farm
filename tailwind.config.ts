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
        pretendard: ["Pretendard", "sans-serif"],
      },
      colors: {
        surface: "#111111",
        card: "#1a1a1a",
        border: "#2a2a2a",
        accent: "#ffffff",
        muted: "#888888",
        subtle: "#555555",
      },
      gridTemplateColumns: {
        cards: "repeat(auto-fill, minmax(260px, 1fr))",
      },
    },
  },
  plugins: [],
};

export default config;
