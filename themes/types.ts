import { Theme } from "../quartz/util/theme"

/**
 * A theme preset manifest. This is the *data-only* contract a theme ships.
 *
 * A normal (community / third-party) theme is exactly this object plus a
 * `theme.scss` structural stylesheet — no arbitrary JavaScript. See
 * `docs/themes.md` for the full contract.
 */
export interface ThemeManifest {
  /**
   * Stable machine id. Must be CSS-safe (lowercase letter, then lowercase
   * alphanumerics / dashes) because it appears unquoted-safe inside the
   * attribute selector `body[data-theme-preset="<id>"]` and is persisted to
   * localStorage. Enforced by `validateThemeRegistry`.
   */
  id: string
  /** Human-facing name shown in the runtime theme switcher menu. */
  label: string
  /** One-line description of the preset's vibe / inspiration. */
  description: string
  /** Color palette (light + dark) and typography — the runtime CSS tokens. */
  theme: Theme
}
