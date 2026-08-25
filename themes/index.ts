// Theme registry, validation, and runtime-token plumbing.
//
// Each preset lives in its own directory under `themes/presets/<id>/`:
//   - `theme.ts`   — a typed `ThemeManifest` (id, label, description, tokens)
//   - `theme.scss` — the preset's structural CSS, scoped to
//                    `body[data-theme-preset="<id>"]`
//
// Adding a normal (data + CSS only) theme requires an import, one registry entry,
// and one SCSS @use in quartz/styles/custom.scss. Runtime tokens, the switcher,
// font loading, and validation derive from the registry. See docs/themes.md.
//
// Why a hand-written registry instead of filesystem scanning: this module is
// bundled by esbuild for the browser (via the switcher) and evaluated by the
// Node build. A `import.meta.glob`-style scan is bundler-specific and not
// portable across Quartz's esbuild config, so the smallest *stable* contract is
// an explicit import list. The tradeoff (one extra import line per theme) is
// documented and enforced by `validateThemeRegistry`.

import type { FontSpecification, Theme } from "../quartz/util/theme"
import { colorVarsBlock, fontVarsBlock, formatFontSpecification } from "../quartz/util/theme"
import { ThemeManifest } from "./types"

import current from "./presets/current/theme"
import notion from "./presets/notion/theme"
import things from "./presets/things/theme"
import anuppuccin from "./presets/anuppuccin/theme"
import bluetopaz from "./presets/bluetopaz/theme"
import carbon from "./presets/carbon/theme"
import nocturne from "./presets/nocturne/theme"
import fieldnotes from "./presets/fieldnotes/theme"

export type { ThemeManifest } from "./types"

/**
 * The ordered list of all shipped theme manifests. The first entry is the
 * conventional build default (overridable in `site.theme.ts`). Order determines
 * the runtime switcher menu order.
 *
 * To add a theme: add an `import`, then append it here. That's it.
 */
export const themeRegistry = [
  current,
  notion,
  things,
  anuppuccin,
  bluetopaz,
  carbon,
  nocturne,
  fieldnotes,
] as const satisfies readonly ThemeManifest[]

/** Union derived from the registry; adding a manifest needs no type edit. */
export type ThemePresetName = (typeof themeRegistry)[number]["id"]

/** All registered preset ids, in registry order. */
export const themePresetNames: ThemePresetName[] = themeRegistry.map((m) => m.id)

/** The build default preset id — the first registry entry. */
export const defaultThemePreset: ThemePresetName = themeRegistry[0].id

const byId = new Map<string, ThemeManifest>(themeRegistry.map((m) => [m.id, m]))

/** Look up a manifest by id. Returns `undefined` for unknown ids. */
export function getThemeManifest(id: string): ThemeManifest | undefined {
  return byId.get(id)
}

/**
 * Back-compat: return the raw `Theme` (color + typography tokens) for a preset.
 * Used by `quartz.config.ts` to pick the build-default theme. Falls back to the
 * Unknown ids fail closed so the theme tokens and data-theme-preset attribute
 * can never describe different presets.
 */
export function createThemePreset(name: string): Theme {
  const manifest = byId.get(name)
  if (!manifest) {
    throw new Error(`Unknown theme preset: ${name}`)
  }
  return manifest.theme
}

const CSS_SAFE_ID = /^[a-z][a-z0-9-]*$/
const REQUIRED_COLOR_TOKENS = [
  "light",
  "lightgray",
  "gray",
  "darkgray",
  "dark",
  "secondary",
  "tertiary",
  "highlight",
  "textHighlight",
] as const

/**
 * Validate a set of manifests against the theme contract. Returns a list of
 * human-readable problem strings (empty === valid). Used by the test suite and
 * the test suite; does not throw.
 */
export function validateThemeRegistry(registry: readonly ThemeManifest[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const m of registry) {
    if (!m || typeof m.id !== "string" || m.id.length === 0) {
      problems.push(`manifest with missing id: ${JSON.stringify(m?.id)}`)
      continue
    }
    if (!CSS_SAFE_ID.test(m.id)) {
      problems.push(`id "${m.id}" is not CSS-safe (need /^[a-z][a-z0-9-]*$/)`)
    }
    if (seen.has(m.id)) {
      problems.push(`duplicate id "${m.id}"`)
    }
    seen.add(m.id)

    if (!m.label) problems.push(`"${m.id}" is missing a label`)
    if (!m.description) problems.push(`"${m.id}" is missing a description`)
    if (!m.theme?.colors) {
      problems.push(`"${m.id}" is missing theme.colors`)
      continue
    }
    for (const mode of ["lightMode", "darkMode"] as const) {
      const scheme = m.theme.colors[mode] as unknown as Record<string, string> | undefined
      if (!scheme) {
        problems.push(`"${m.id}" is missing colors.${mode}`)
        continue
      }
      for (const token of REQUIRED_COLOR_TOKENS) {
        if (typeof scheme[token] !== "string" || scheme[token].length === 0) {
          problems.push(`"${m.id}".${mode} is missing required token "${token}"`)
        }
      }
    }
    if (!m.theme.typography?.header) problems.push(`"${m.id}" is missing typography.header`)
  }

  return problems
}

/**
 * Emit CSS custom-property blocks for every preset, scoped to
 * `body[data-theme-preset="<id>"]` (light mode) and paired with
 * `:root[saved-theme="dark"]` (dark mode). A single build ships these blocks for
 * ALL presets, which is what makes runtime hot-switching possible without a
 * rebuild: flipping `body.dataset.themePreset` re-points every `var(--…)`.
 *
 * Each block is ALSO scoped to `html[data-theme-preset="<id>"]` so the pre-paint
 * restore script — which runs in `<head>` before `<body>` exists and can only
 * touch `document.documentElement` — takes effect on the very first frame,
 * avoiding a flash of the build-default palette.
 *
 * The `:root` block written by `joinStyles` remains the build default and wins
 * before the switcher runs; these element-scoped blocks have higher specificity
 * so a selected preset overrides the default.
 */
export function buildAllPresetTokens(registry: readonly ThemeManifest[]): string {
  const blocks: string[] = []
  for (const { id, theme } of registry) {
    blocks.push(`html[data-theme-preset="${id}"],
body[data-theme-preset="${id}"] {
${colorVarsBlock(theme.colors.lightMode)}

${fontVarsBlock(theme)}
}`)
    blocks.push(`:root[saved-theme="dark"][data-theme-preset="${id}"],
:root[saved-theme="dark"] body[data-theme-preset="${id}"] {
${colorVarsBlock(theme.colors.darkMode)}
}`)
  }
  return blocks.join("\n\n")
}

/**
 * A single deduplicated Google Fonts css2 request covering every font family
 * used by any preset. This lets one build carry the fonts for all presets so
 * switching never needs a network round-trip for a font that was already loaded.
 *
 * Performance tradeoff: one combined request is larger than a single-theme
 * request (all ~15 families vs. 3). We de-duplicate families so shared fonts
 * (e.g. Inter, IBM Plex Mono) are requested once. For a site that pins one
 * preset and never exposes the switcher, `googleFontHref(theme)` is lighter — but
 * the whole point of this template is runtime switching, so we opt into the
 * combined request.
 */
export function allPresetsGoogleFontHref(registry: readonly ThemeManifest[]): string {
  const families = new Map<string, { weights: Set<number>; italic: boolean }>()
  const add = (role: "title" | "header" | "body" | "code", raw: FontSpecification) => {
    const spec = typeof raw === "string" ? { name: raw } : raw
    const defaultWeights = role === "header" ? [400, 700] : [400, 600]
    const entry = families.get(spec.name) ?? { weights: new Set<number>(), italic: false }
    for (const weight of spec.weights ?? defaultWeights) entry.weights.add(weight)
    entry.italic ||= spec.includeItalic ?? role === "body"
    families.set(spec.name, entry)
  }

  for (const { theme } of registry) {
    if (theme.fontOrigin !== "googleFonts") continue
    if (theme.typography.title) add("title", theme.typography.title)
    add("header", theme.typography.header)
    add("body", theme.typography.body)
    add("code", theme.typography.code)
  }

  const query = [...families.entries()]
    .map(([name, data]) =>
      formatFontSpecification("body", {
        name,
        weights: [...data.weights].sort((a, b) => a - b),
        includeItalic: data.italic,
      }),
    )
    .map((family) => `family=${family}`)
    .join("&")
  return `https://fonts.googleapis.com/css2?${query}&display=swap`
}
