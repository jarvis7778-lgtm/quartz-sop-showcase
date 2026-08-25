import { ThemeManifest } from "../../types"

// notion — Notion public pages. Real Notion values: graphite ink #37352f,
// link blue #337ea9, accent orange #d9730d, warm hairlines, #191919 dark canvas.
const manifest: ThemeManifest = {
  id: "notion",
  label: "Notion",
  description: "Notion workspace — cover page, properties, database rows, quiet document canvas.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "Inter",
      body: "Inter",
      code: "JetBrains Mono",
    },
    colors: {
      lightMode: {
        light: "#ffffff",
        lightgray: "#ebeae8",
        gray: "#9b9a97",
        darkgray: "#57534e",
        dark: "#37352f",
        secondary: "#337ea9",
        tertiary: "#d9730d",
        highlight: "rgba(51, 126, 169, 0.08)",
        textHighlight: "#fdecc8aa",
      },
      darkMode: {
        light: "#191919",
        lightgray: "#2e2e2e",
        gray: "#7f7f7f",
        darkgray: "#d3d1cb",
        dark: "#ececec",
        secondary: "#529cca",
        tertiary: "#e2984a",
        highlight: "rgba(82, 156, 202, 0.12)",
        textHighlight: "#89632a66",
      },
    },
  },
}

export default manifest
