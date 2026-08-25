import { ThemeManifest } from "../../types"

// carbon — IBM Carbon design language. Laboratory operations console: strict
// white / gray / near-black neutrals with a single electric IBM blue (#0f62fe /
// dark #4589ff). IBM Plex Sans + Plex Mono, zero radius, flat zoning, no shadows.
// gray/darkgray are the true Carbon token grays; tertiary is a slightly lighter
// blue so the global a:hover stays inside the electric-blue family.
const manifest: ThemeManifest = {
  id: "carbon",
  label: "IBM Carbon",
  description: "IBM Carbon operations console — electric blue, zero-radius tiles.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "IBM Plex Sans",
      body: "IBM Plex Sans",
      code: "IBM Plex Mono",
    },
    colors: {
      lightMode: {
        light: "#ffffff", // white — content field
        lightgray: "#e0e0e0", // gray-20 hairlines
        gray: "#8d8d8d", // gray-50 mid neutral
        darkgray: "#525252", // gray-70 secondary text
        dark: "#161616", // gray-100 near-black ink
        secondary: "#0f62fe", // blue-60 — the one electric accent
        tertiary: "#0043ce", // blue-70 — pressed / hover
        highlight: "rgba(15, 98, 254, 0.08)",
        textHighlight: "#fddc6999",
      },
      darkMode: {
        light: "#161616", // gray-100 console shell
        lightgray: "#393939", // gray-80 tile borders
        gray: "#8d8d8d", // gray-50 holds in dark too
        darkgray: "#c6c6c6", // gray-30 secondary text
        dark: "#f4f4f4", // gray-10 near-white ink
        secondary: "#4589ff", // blue-50 electric on dark
        tertiary: "#78a9ff", // blue-40 hover
        highlight: "rgba(69, 137, 255, 0.14)",
        textHighlight: "#b3891a55",
      },
    },
  },
}

export default manifest
