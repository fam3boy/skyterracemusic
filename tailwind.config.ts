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
            50: "#FBFBFB",
            100: "#F8F8F8",
            200: "#EEEEEE",
            300: "#DDDDDD",
            400: "#999999",
            500: "#666666",
            600: "#333333",
            700: "#262626",
            800: "#1A1A1A",
            900: "#171717",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
