import { ThemeManifest } from "../../types"

// bluetopaz — Blue Topaz. Scholarly paper-and-ink: warm paper ground, topaz
// blue, cinnabar seal-red hover (a deliberate scholarly touch). Serif headers.
// Noto SC fonts have no italic axis on Google Fonts — includeItalic must stay
// false for the body font or the whole css2 request 404s and all fonts fall back.
const manifest: ThemeManifest = {
  id: "bluetopaz",
  label: "Blue Topaz",
  description: "Scholarly paper-and-ink, CJK-friendly serif with cinnabar hover.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: { name: "Noto Serif SC", weights: [400, 500, 700] },
      body: { name: "Noto Sans SC", weights: [400, 500, 700], includeItalic: false },
      code: "JetBrains Mono",
    },
    colors: {
      lightMode: {
        light: "#faf7f0",
        lightgray: "#e7dfd1",
        gray: "#a29a87",
        darkgray: "#4d4737",
        dark: "#2c2a24",
        secondary: "#2f6fa7",
        tertiary: "#b0562f",
        highlight: "rgba(47, 111, 167, 0.08)",
        textHighlight: "#e8c47a66",
      },
      darkMode: {
        light: "#1b2027",
        lightgray: "#2e3642",
        gray: "#7d8695",
        darkgray: "#c9c4b4",
        dark: "#f0ebdd",
        secondary: "#6ea3d8",
        tertiary: "#d98a63",
        highlight: "rgba(110, 163, 216, 0.12)",
        textHighlight: "#d9a05f40",
      },
    },
  },
}

export default manifest
