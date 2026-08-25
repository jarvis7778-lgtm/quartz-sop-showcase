import { ThemeManifest } from "../../types"

// current — bold editorial coral + orange. The template default.
const manifest: ThemeManifest = {
  id: "current",
  label: "Current (editorial)",
  description: "Bold editorial magazine look — coral red + warm orange accents.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "Sora",
      body: "Manrope",
      code: "Space Mono",
    },
    colors: {
      lightMode: {
        light: "#fdf7f2",
        lightgray: "#f0e3da",
        gray: "#b89a8a",
        darkgray: "#4a3a36",
        dark: "#1a1012",
        secondary: "#e84a5f",
        tertiary: "#ff8c42",
        highlight: "rgba(232,74,95,0.07)",
        textHighlight: "#ffb86c66",
      },
      darkMode: {
        light: "#150f12",
        lightgray: "#2c1e23",
        gray: "#7a5d5a",
        darkgray: "#e0cdc6",
        dark: "#fbeee8",
        secondary: "#ff6b81",
        tertiary: "#ffa15c",
        highlight: "rgba(255,107,129,0.1)",
        textHighlight: "#ff8c4244",
      },
    },
  },
}

export default manifest
