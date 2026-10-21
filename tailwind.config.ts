import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04060d",
          900: "#090c16",
          800: "#10141f",
          700: "#1a2030",
          600: "#242c40",
          500: "#303a52",
        },
        accent: {
          50: "#eaf2ff",
          100: "#d3e4ff",
          200: "#a9cdff",
          300: "#7ab4ff",
          400: "#4a99ff",
          500: "#1f7fff",
          600: "#0c66e8",
          700: "#0b54c2",
          800: "#0c4591",
          900: "#0e3a73",
        },
        cyanx: {
          DEFAULT: "#38e1ff",
          100: "#c9f7ff",
          200: "#9cf2ff",
          300: "#6beaff",
          400: "#38e1ff",
          500: "#0ecfe9",
        },
        violetx: {
          DEFAULT: "#8b5cf6",
          300: "#a78bfa",
          400: "#8b5cf6",
          500: "#7c3aed",
        },
        signal: {
          DEFAULT: "#1f7fff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        container: "80rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(31,127,255,0.25), 0 8px 40px -12px rgba(31,127,255,0.45)",
        "glow-bright": "0 0 0 1px rgba(56,225,255,0.35), 0 0 30px -4px rgba(56,225,255,0.45), 0 18px 60px -18px rgba(31,127,255,0.7)",
        card: "0 1px 2px rgba(0,0,0,0.3), 0 24px 64px -28px rgba(0,6,20,0.9)",
        "card-raised": "0 0 0 1px rgba(122,180,255,0.14), 0 12px 40px -12px rgba(31,127,255,0.35), 0 28px 80px -24px rgba(0,6,20,0.9)",
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "grid-fine":
          "linear-gradient(to right, rgba(122,180,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,180,255,0.05) 1px, transparent 1px)",
        "grid-dots": "radial-gradient(rgba(122,180,255,0.16) 1px, transparent 1px)",
        "aurora-mid":
          "radial-gradient(60% 50% at 50% 0%, rgba(31,127,255,0.16) 0%, rgba(11,30,60,0.0) 70%, transparent 100%)",
        "aurora-top":
          "radial-gradient(45% 35% at 50% 0%, rgba(56,225,255,0.12) 0%, transparent 70%)",
        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        "gradient-brand":
          "linear-gradient(120deg, #4a99ff 0%, #38e1ff 50%, #a78bfa 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          to: { transform: "rotate(-360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "sheen": {
          "0%": { transform: "translateX(-130%) skewX(-18deg)" },
          "100%": { transform: "translateX(230%) skewX(-18deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.9" },
        },
        "grid-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 40px" },
        },
        dash: {
          to: { strokeDashoffset: "0" },
        },
        oscillate: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        "wave-scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float-slow 11s ease-in-out infinite",
        "spin-slower": "spin-slow 32s linear infinite",
        "spin-reverse": "spin-reverse 22s linear infinite",
        "spin-reverse-slower": "spin-reverse 44s linear infinite",
        shimmer: "shimmer 3.2s linear infinite",
        "pulse-ring": "pulse-ring 3s cubic-bezier(0.4,0,0.6,1) infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "grid-move": "grid-move 3s linear infinite",
        dash: "dash 1.6s ease-out forwards",
        oscillate: "oscillate 1.1s ease-in-out infinite",
        "wave-scan": "wave-scan 7s ease-in-out infinite",
        marquee: "marquee 36s linear infinite",
        "fade-in": "fade-in 0.8s ease-out both",
        "rise-in": "rise-in 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "zoom-in": "zoom-in 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;