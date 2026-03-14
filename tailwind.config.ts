import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hyundai: {
          emerald: "#006847",
          gold: "#D4AF37",
          black: "#1D1D1D",
          gray: {
            100: "#F5F5F5",
            200: "#E5E5E5",
            500: "#737373",
            900: "#171717",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
