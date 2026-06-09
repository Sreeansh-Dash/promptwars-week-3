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
        background: "#fbf9f4",
        surface: "#f0eee9",
        primary: "#173124",
        "primary-container": "#2d4739",
        "on-primary": "#ffffff",
        secondary: "#4e6353",
        "secondary-container": "#d1e9d4",
        tertiary: "#521801",
        "tertiary-container": "#702d13",
        outline: "#727973",
        error: "#ba1a1a",
      },
    },
  },
  plugins: [],
};
export default config;
