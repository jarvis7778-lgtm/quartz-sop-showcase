import { ThemeManifest } from "../../types"

// nocturne — cinematic near-black research archive. Space Grotesk display +
// IBM Plex Mono labels, charcoal surfaces, coral signal accent with an electric
// cyan/blue interactive accent. Dark-first: the light palette stays cinematic
// charcoal (intentional), the dark toggle deepens to true near-black without
// breaking contrast. secondary = coral, tertiary = cyan (a:hover glows cyan).
const manifest: ThemeManifest = {
  id: "nocturne",
  label: "Nocturne",
  description: "Cinematic near-black research archive — coral signal + cyan.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "Space Grotesk",
      body: "Space Grotesk",
      code: "IBM Plex Mono",
    },
    colors: {
      lightMode: {
        // "light" mode is a lifted charcoal — cinematic, not white
        light: "#1c1e24", // graphite canvas
        lightgray: "#33363f", // rule / tile borders
        gray: "#7f8694", // muted slate labels
        darkgray: "#c3c8d2", // secondary text
        dark: "#f2f4f8", // near-white display ink
        secondary: "#ff6b57", // coral signal
        tertiary: "#3ad1e0", // electric cyan interactive
        highlight: "rgba(58, 209, 224, 0.12)",
        textHighlight: "#ff6b5744",
      },
      darkMode: {
        // deeper near-black for the dark toggle
        light: "#0d0e12", // near-black archive
        lightgray: "#22242c", // charcoal surfaces
        gray: "#6c7280", // slate labels
        darkgray: "#b6bcc8", // secondary text
        dark: "#f4f6fa", // display ink
        secondary: "#ff7a63", // coral (lifted for contrast)
        tertiary: "#4fe0ef", // cyan (lifted)
        highlight: "rgba(79, 224, 239, 0.14)",
        textHighlight: "#ff7a6344",
      },
    },
  },
}

export default manifest
