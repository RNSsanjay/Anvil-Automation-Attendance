import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        secondary: "#A78BFA",
        accent: "#A78BFA",
        background: "#FFFFFF",
        "text-primary": "#0F0A1E",
        "text-secondary": "#6B7280",
        border: "#EDE9FE",
        card: "#FAFAFF",
      },
      fontFamily: {
        headings: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-violet": "pulse-violet 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "meteor-effect": "meteor 5s linear infinite",
      },
      keyframes: {
        "meteor": {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "shimmer": {
          "from": {
            "backgroundPosition": "0 0"
          },
          "to": {
            "backgroundPosition": "-200% 0"
          }
        },
        "pulse-violet": {
          "0%, 100%": {
            "opacity": "1",
            "transform": "scale(1)",
          },
          "50%": {
            "opacity": ".5",
            "transform": "scale(1.05)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
