/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070a14",
          900: "#0b1024",
          800: "#11173a",
          700: "#1a2150",
          600: "#262e6b",
        },
        gold: {
          50: "#e3f5ec",
          100: "#b9e4cf",
          200: "#7dcaa3",
          300: "#2f9e64",
          400: "#22824f",
          500: "#1a6b40",
          600: "#135432",
          700: "#0d3d25",
        },
        emerald: {
          deep: "#0f3a32",
          glow: "#1aa084",
        },
        rose: {
          glow: "#e25d8d",
        },
        sand: {
          50: "#f8f5ec",
          100: "#ece5cf",
        },
      },
      fontFamily: {
        arabic: [
          "Amiri",
          "Scheherazade New",
          "Noto Naskh Arabic",
          "serif",
        ],
        display: [
          "Cormorant Garamond",
          "Tajawal",
          "Georgia",
          "serif",
        ],
        sans: [
          "Tajawal",
          "Inter",
          "Cairo",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(47,158,100,0.35)",
        deep: "0 30px 80px -30px rgba(11,16,36,0.85)",
        glass:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px -30px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "cosmic":
          "radial-gradient(1200px 800px at 15% 0%, rgba(47,158,100,0.18), transparent 55%), radial-gradient(1000px 700px at 90% 30%, rgba(26,160,132,0.18), transparent 55%), radial-gradient(800px 600px at 50% 100%, rgba(226,93,141,0.12), transparent 55%), linear-gradient(180deg,#070a14 0%,#0b1024 60%,#070a14 100%)",
        "soft-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(47,158,100,0.6), transparent)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%,100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};