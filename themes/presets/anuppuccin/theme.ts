import { ThemeManifest } from "../../types"

// anuppuccin — AnuPpuccin / Catppuccin. Light = Latte, dark = Mocha (real palette
// values). Mauve accent, pink secondary accent; per-level heading tints live in
// the preset's SCSS block.
const manifest: ThemeManifest = {
  id: "anuppuccin",
  label: "AnuPpuccin",
  description: "Catppuccin Latte/Mocha pastels with colorful per-level headings.",
  theme: {
    fontOrigin: "googleFonts",
    cdnCaching: true,
    typography: {
      header: "Nunito",
      body: "Nunito Sans",
      code: "Fira Code",
    },
    colors: {
      lightMode: {
        light: "#eff1f5", // latte base
        lightgray: "#dce0e8", // latte crust
        gray: "#8c8fa1", // latte overlay1
        darkgray: "#5c5f77", // latte subtext1
        dark: "#4c4f69", // latte text
        secondary: "#8839ef", // latte mauve
        tertiary: "#ea76cb", // latte pink
        highlight: "rgba(136, 57, 239, 0.07)",
        textHighlight: "#df8e1d4d", // latte yellow
      },
      darkMode: {
        light: "#1e1e2e", // mocha base
        lightgray: "#313244", // mocha surface0
        gray: "#6c7086", // mocha overlay0
        darkgray: "#bac2de", // mocha subtext1
        dark: "#cdd6f4", // mocha text
        secondary: "#cba6f7", // mocha mauve
        tertiary: "#f5c2e7", // mocha pink
        highlight: "rgba(203, 166, 247, 0.1)",
        textHighlight: "#f9e2af40", // mocha yellow
      },
    },
  },
}

export default manifest
