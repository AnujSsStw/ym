import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#f25939",
        secondary: "#292929",
        cream: "#f3e2d6", // Add your custom color here
      },
    },
  },
  plugins: [],
} satisfies Config;
