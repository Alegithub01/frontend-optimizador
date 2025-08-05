import type { Config } from "tailwindcss"
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        orange: {
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#FF9729",
        },
        green: {
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          0:"#6BCE44",
        },
        purple: {
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
        },
        blue: {
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
        },
        gray: {
          0:"#F3F3F3",
          1: "#1E1E1E",
          2: "#7E7E7E",
          3:"#404040",
          4:"#272727",
          5:"#747474",
          6:"#F3F3F3",
          7:"#535353",
          8:"#656565"
        },
        skyblue: {
          0:"#018EFA",
        },
        red: {
          0:"#FF0353",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui'],
        anton: ['"Anton"', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
        amsipro: ['"AmsiPro"', 'sans-serif'],
        amsiprocondultra: ['"AmsiProCondUltra"', 'sans-serif'],
        amsipronarwultra: ['"AmsiProNarwUltra"', 'sans-serif'],
        },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
