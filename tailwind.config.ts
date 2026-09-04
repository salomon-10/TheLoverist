import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Fond de page / surfaces — plateforme claire, propre
        paper: "#FFFFFF",
        surface: "#F6F6F8",
        "surface-sunken": "#EFEEF3",
        // Texte & lignes
        ink: "#18181F",
        muted: "#6B6A75",
        line: "#E5E4EA",
        "line-strong": "#D2D1D9",
        // Accent unique — indigo profond, ton "plateforme professionnelle"
        accent: "#3730A9",
        "accent-hover": "#2D2689",
        "accent-soft": "#EEEDFB",
        // État "aimé" / erreur
        signal: "#DC2626",
        "signal-soft": "#FEF0EF",
        // Badges de catégorie
        tag: "#0F766E",
        "tag-soft": "#EBF7F5"
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["52px", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["34px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" }],
        headline: ["26px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-sm": ["19px", { lineHeight: "1.35", letterSpacing: "-0.005em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.7", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["11px", { lineHeight: "1.2", letterSpacing: "0.06em", fontWeight: "600" }]
      },
      spacing: {
        "margin-mobile": "20px",
        "margin-desktop": "48px",
        gutter: "24px",
        "stack-xs": "8px",
        "stack-sm": "16px",
        "stack-md": "40px",
        "stack-lg": "56px",
        "stack-xl": "80px"
      },
      maxWidth: {
        reading: "720px",
        column: "860px",
        canvas: "1240px"
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "10px",
        lg: "16px",
        full: "9999px"
      },
      boxShadow: {
        card: "0 1px 2px rgb(24 24 31 / 0.04), 0 1px 1px rgb(24 24 31 / 0.03)",
        "card-hover": "0 12px 24px -8px rgb(24 24 31 / 0.12), 0 2px 6px rgb(24 24 31 / 0.05)",
        float: "0 12px 32px -8px rgb(24 24 31 / 0.22), 0 2px 8px rgb(24 24 31 / 0.08)",
        header: "0 1px 0 0 rgb(24 24 31 / 0.06)"
      },
      transitionTimingFunction: {
        platform: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      keyframes: {
        "pop-heart": {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.32)" },
          "60%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" }
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "field-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "card-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "pop-heart": "pop-heart 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
        "toast-in": "toast-in 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        "field-in": "field-in 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
        "card-in": "card-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;
