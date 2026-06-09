import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-bright": "#2c3a4c",
        "on-background": "#d4e4fa",
        "surface-container-high": "#1c2b3c",
        "surface-container": "#122131",
        "on-surface-variant": "#bbcabf",
        "on-surface": "#d4e4fa",
        "inverse-surface": "#d4e4fa",
        "outline": "#86948a",
        "tertiary": "#bec6e0",
        "outline-variant": "#3c4a42",
        "secondary": "#44e2cd",
        "tertiary-container": "#9ba2bb",
        "on-primary": "#003824",
        "primary-container": "#10b981",
        "background": "#051424",
        "surface-container-low": "#0d1c2d",
        "secondary-container": "#03c6b2",
        "surface": "#051424",
        "surface-variant": "#273647",
        "primary": "#4edea3",
        "surface-container-lowest": "#010f1f",
      },
    },
  },
  plugins: [],
};
export default config;
