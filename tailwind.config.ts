import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#090909", panel: "#141414", gold: "#c7a76c", ivory: "#f3eee6" } } },
  plugins: []
};
export default config;