import { Theme } from "../quartz/util/theme"

export type ThemePresetName = "current" | "notion" | "things" | "anuppuccin" | "bluetopaz"

const current: Theme = {
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
}

// notion — Notion public pages. Real Notion values: graphite ink #37352f,
// link blue #337ea9, accent orange #d9730d, warm hairlines, #191919 dark canvas.
const notion: Theme = {
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
}

// things — Things 3 (Cultured Code). Crisp white, friendly iOS blue #2e80f2,
// soft fills and generous radii instead of borders. Airy and approachable.
// tertiary doubles as the global link-hover color, so it stays in the blue family.
const things: Theme = {
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
}

// anuppuccin — AnuPpuccin / Catppuccin. Light = Latte, dark = Mocha (real palette
// values). Mauve accent, pink secondary accent; per-level heading tints live in
// the preset's SCSS block.
const anuppuccin: Theme = {
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
}

// bluetopaz — Blue Topaz. Scholarly paper-and-ink: warm paper ground, topaz
// blue, cinnabar seal-red hover (a deliberate scholarly touch). Serif headers.
// Noto SC fonts have no italic axis on Google Fonts — includeItalic must stay
// false for the body font or the whole css2 request 404s and all fonts fall back.
const bluetopaz: Theme = {
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
}

const presets: Record<ThemePresetName, Theme> = {
  current,
  notion,
  things,
  anuppuccin,
  bluetopaz,
}

export function createThemePreset(name: ThemePresetName): Theme {
  return presets[name]
}
