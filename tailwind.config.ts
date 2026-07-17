import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lagoon: "#19b7a6",
        reef: "#2563eb",
        ember: "#f97316",
        shell: "#f8fafc",
        midnight: "#08111f",
      },
      boxShadow: {
        glow: "0 18px 60px rgba(25, 183, 166, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
