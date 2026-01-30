import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "Arial"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.18)"
      }
    },
  },
  plugins: [],
};
export default config;
