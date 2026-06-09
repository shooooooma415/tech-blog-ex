import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5b6cff",
          dark: "#3b4ad8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
