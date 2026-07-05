import { Theme } from "../quartz/util/theme"

export type ThemePresetName = "current" | "minimal" | "notion"

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

// minimal — Stripe / Vercel / Linear docs.
// Pure white canvas, cool neutral slate grays, a single restrained indigo accent.
// Hierarchy comes from type weight and 1px borders, never from color or shadow.
const minimal: Theme = {
  fontOrigin: "googleFonts",
  cdnCaching: true,
  typography: {
    header: "Inter",
    body: "Inter",
    code: "JetBrains Mono",
  },
  colors: {
    lightMode: {
      light: "#ffffff", // page canvas — true white
      lightgray: "#e8eaed", // 1px borders / rules
      gray: "#8b909a", // muted meta text
      darkgray: "#4a5160", // body copy (slate)
      dark: "#1c2024", // headings / strong ink
      secondary: "#4f46e5", // indigo accent (links, active)
      tertiary: "#6366f1", // secondary indigo (hover)
      highlight: "rgba(79, 70, 229, 0.06)", // faint accent wash
      textHighlight: "#c7d2fe88", // ==highlight==
    },
    darkMode: {
      light: "#0c0d10", // near-black canvas
      lightgray: "#23262d", // borders
      gray: "#6b7280", // muted meta
      darkgray: "#c2c8d2", // body copy
      dark: "#f4f6f8", // headings
      secondary: "#818cf8", // indigo accent
      tertiary: "#a5b4fc", // hover
      highlight: "rgba(129, 140, 248, 0.1)",
      textHighlight: "#4f46e555",
    },
  },
}

// notion — Notion public page / Super.so / Potion.
// Warm off-white page sitting on a soft warm-gray workspace, warm graphite ink,
// calm muted-blue accent. Document blocks, not SaaS cards.
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
      light: "#ffffff", // document surface — white pages
      lightgray: "#ebeae8", // warm hairline borders / rules
      gray: "#9b9588", // warm muted meta
      darkgray: "#54504a", // warm body copy
      dark: "#2f2c28", // Notion graphite ink
      secondary: "#3a72b0", // calm muted blue (page links)
      tertiary: "#cf8a5b", // warm clay secondary accent
      highlight: "rgba(58, 114, 176, 0.07)",
      textHighlight: "#fae9c466",
    },
    darkMode: {
      light: "#23211e", // warm dark document surface
      lightgray: "#37342f", // borders
      gray: "#8c857a", // warm muted meta
      darkgray: "#d6d0c6", // body copy
      dark: "#f5f1ea", // warm light ink
      secondary: "#7eb0de", // muted blue
      tertiary: "#e3a979", // warm clay
      highlight: "rgba(126, 176, 222, 0.12)",
      textHighlight: "#c9a25e44",
    },
  },
}

const presets: Record<ThemePresetName, Theme> = {
  current,
  minimal,
  notion,
}

export function createThemePreset(name: ThemePresetName): Theme {
  return presets[name]
}
