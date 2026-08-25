// Browser-free pure helpers for the runtime theme switcher.
//
// These are deliberately DOM-free so they can be unit-tested without a browser
// and reused verbatim by the inline switcher script (which runs in the page).
// The inline script imports only these helpers plus the registry data.

import { defaultThemePreset, themePresetNames } from "./index"

/**
 * localStorage key for the selected *visual preset*. Intentionally distinct from
 * Quartz's built-in `"theme"` key (light/dark), so choosing a preset never
 * clobbers the dark/light toggle and vice-versa.
 */
export const THEME_PRESET_STORAGE_KEY = "themePreset"

/** True iff `value` is a registered preset id. */
export function isValidPreset(value: unknown): value is string {
  return typeof value === "string" && themePresetNames.includes(value)
}

/**
 * Resolve the preset to apply, given a (possibly missing / invalid) saved value
 * and a build-default id.
 *
 *   1. a valid saved value wins (user's explicit choice),
 *   2. otherwise a valid build default,
 *   3. otherwise the registry default — so the result is ALWAYS a real preset
 *      and the body is never left unstyled.
 */
export function resolveThemePreset(saved: unknown, buildDefault: string): string {
  if (isValidPreset(saved)) return saved
  if (isValidPreset(buildDefault)) return buildDefault
  return defaultThemePreset
}
