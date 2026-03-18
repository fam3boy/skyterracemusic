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
          emerald: "var(--hyundai-emerald)",
          gold: "var(--hyundai-gold)",
          black: "var(--hyundai-black)",
          accent: "var(--hyundai-accent)",
          gray: {
            50: "var(--hyundai-gray-50)",
            100: "var(--hyundai-gray-100)",
            200: "var(--hyundai-gray-200)",
            300: "var(--hyundai-gray-300)",
            400: "var(--hyundai-gray-400)",
            500: "var(--hyundai-gray-500)",
            600: "var(--hyundai-gray-600)",
            700: "var(--hyundai-gray-700)",
            800: "var(--hyundai-gray-800)",
            900: "var(--hyundai-gray-900)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
