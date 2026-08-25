import { ThemeManifest } from "../../types"

// fieldnotes — tactile expedition / lab field notebook. Cream recycled paper,
// dark forest-ink text, safety-label orange accent. Serif display headers
// (Fraunces) paired with a humanist sans body (Source Sans 3) and mono labels
// (IBM Plex Mono). Utilitarian, annotated, archival — ruled/grid notebook cues
// live in the SCSS block. secondary = forest ink-blue, tertiary = safety orange.
const manifest: ThemeManifest = {
  id: "fieldnotes",
  label: "Field Notes",
  description: "Tactile field notebook — cream paper, forest ink, safety orange.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "Fraunces",
      body: "Source Sans 3",
      code: "IBM Plex Mono",
    },
    colors: {
      lightMode: {
        light: "#f4efe1", // recycled cream paper
        lightgray: "#d8cfba", // ruled-line tan
        gray: "#9a8f76", // faded pencil
        darkgray: "#4a5343", // forest slate secondary
        dark: "#23291f", // dark forest ink
        secondary: "#3d6b52", // field green-ink
        tertiary: "#d1622a", // safety-label orange
        highlight: "rgba(209, 98, 42, 0.09)",
        textHighlight: "#e9b84a80",
      },
      darkMode: {
        // dark = a field notebook read under lamplight: deep drab olive-black
        light: "#1e1f19", // dark drab canvas
        lightgray: "#333329", // ruled lines
        gray: "#7d775f", // faded pencil
        darkgray: "#c4bda3", // aged-paper secondary text
        dark: "#efe7d0", // warm off-white ink
        secondary: "#7fb08d", // lifted field-green
        tertiary: "#e8823f", // safety orange
        highlight: "rgba(232, 130, 63, 0.13)",
        textHighlight: "#c9982f4d",
      },
    },
  },
}

export default manifest
