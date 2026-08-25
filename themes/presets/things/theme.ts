import { ThemeManifest } from "../../types"

// things — Things 3 (Cultured Code). Crisp white, friendly iOS blue #2e80f2,
// soft fills and generous radii instead of borders. Airy and approachable.
// tertiary doubles as the global link-hover color, so it stays in the blue family.
const manifest: ThemeManifest = {
  id: "things",
  label: "Things 3",
  description:
    "Things-inspired Today view — blue navigation rail, task circles, focused project sheet.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "Plus Jakarta Sans",
      body: "Inter",
      code: "JetBrains Mono",
    },
    colors: {
      lightMode: {
        light: "#ffffff",
        lightgray: "#e9ecef",
        gray: "#97a1ab",
        darkgray: "#43484d",
        dark: "#1f2328",
        secondary: "#2e80f2",
        tertiary: "#1b6ad6",
        highlight: "rgba(46, 128, 242, 0.08)",
        textHighlight: "#ffe98a99",
      },
      darkMode: {
        light: "#17191e",
        lightgray: "#2a2d33",
        gray: "#6d7680",
        darkgray: "#c8cdd2",
        dark: "#f2f4f6",
        secondary: "#4b96f8",
        tertiary: "#7cb3fa",
        highlight: "rgba(75, 150, 248, 0.12)",
        textHighlight: "#ffd60a3d",
      },
    },
  },
}

export default manifest
