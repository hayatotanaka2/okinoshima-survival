import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lagoon: "#00bfd6",
        reef: "#6d4aff",
        ember: "#ff2b93",
        shell: "#ffffff",
        midnight: "#ffffff",
        ink: "#202744",
        lime: "#a8e600",
        sun: "#ffd83d",
        slate: {
          200: "#30395c",
          300: "#4d5677",
          400: "#68708e",
          950: "#eef2f8",
        },
      },
      boxShadow: {
        glow: "0 18px 50px rgba(103, 73, 255, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
