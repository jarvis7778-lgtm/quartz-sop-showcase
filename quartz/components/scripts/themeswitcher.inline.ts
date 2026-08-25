import {
  isValidPreset,
  resolveThemePreset,
  THEME_PRESET_STORAGE_KEY,
} from "../../../themes/switcher"
import { defaultThemePreset } from "../../../themes"

// The build default baked onto <body data-theme-preset="…"> in the served HTML.
// Read it once from the parsed body if present, else the registry default.
function getBuildDefault(): string {
  const fromBody = document.body?.dataset.themePreset
  return isValidPreset(fromBody) ? (fromBody as string) : defaultThemePreset
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(THEME_PRESET_STORAGE_KEY)
  } catch {
    return null
  }
}

function persist(preset: string) {
  try {
    localStorage.setItem(THEME_PRESET_STORAGE_KEY, preset)
  } catch {
    /* private mode / storage disabled — selection still applies for this page */
  }
}

function loadPresetFont(href: string | undefined) {
  if (!href) return
  let link = document.getElementById("theme-fonts") as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.id = "theme-fonts"
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

// Apply a preset to the live DOM. We set it on BOTH <html> and <body>:
//  - <html> so the pre-paint restore (which runs before <body> is parsed) styles
//    the first frame via the html[data-theme-preset] token blocks,
//  - <body> because the shipped structural theme CSS is scoped to
//    body[data-theme-preset] and because SPA micromorph rewrites the body attr.
function applyPreset(preset: string) {
  document.documentElement.setAttribute("data-theme-preset", preset)
  if (document.body) {
    document.body.setAttribute("data-theme-preset", preset)
  }
}

// ── Pre-paint restore ──────────────────────────────────────────────────────
// Runs synchronously in <head> (beforeDOMLoaded), before <body> is parsed. Only
// <html> is available here; setting it avoids a flash of the build-default
// palette. An invalid saved value falls back to the build default safely.
;(function restoreBeforePaint() {
  // <body> does not exist while the head prescript runs, so renderPage mirrors
  // the configured build default onto <html data-theme-preset="…">.
  const fromHtml = document.documentElement.dataset.themePreset
  const buildDefault = isValidPreset(fromHtml) ? fromHtml : defaultThemePreset
  const resolved = resolveThemePreset(readSaved(), buildDefault)
  document.documentElement.setAttribute("data-theme-preset", resolved)

  // Structural theme rules are intentionally scoped to <body>. Install the
  // observer before the parser creates <body> so a saved non-default preset is
  // mirrored there at the first possible microtask, before the first paint.
  if (document.body) {
    document.body.setAttribute("data-theme-preset", resolved)
  } else {
    const observer = new MutationObserver(() => {
      if (!document.body) return
      document.body.setAttribute("data-theme-preset", resolved)
      observer.disconnect()
    })
    observer.observe(document.documentElement, { childList: true })
  }
})()

const emitPresetChange = (preset: string) => {
  document.dispatchEvent(new CustomEvent("themepresetchange", { detail: { preset } }))
  const savedTheme = document.documentElement.getAttribute("saved-theme")
  const theme = savedTheme === "dark" ? "dark" : "light"
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
}

// ── Per-navigation wiring ──────────────────────────────────────────────────
document.addEventListener("nav", () => {
  // Re-apply the saved preset every navigation: SPA morphing rewrites the body's
  // data-theme-preset back to the build default from the fetched page.
  const current = resolveThemePreset(readSaved(), getBuildDefault())
  applyPreset(current)

  const switchers = Array.from(document.getElementsByClassName("theme-switcher")) as HTMLElement[]

  for (const switcher of switchers) {
    const select = switcher.querySelector<HTMLSelectElement>(".theme-switcher-select")
    if (!select) continue

    select.value = current

    const onChange = () => {
      const preset = select.value
      if (!isValidPreset(preset)) return
      const selectedOption = select.selectedOptions[0]
      loadPresetFont(selectedOption?.dataset.themeFontHref)
      applyPreset(preset)
      persist(preset)
      emitPresetChange(preset)
      for (const other of switchers) {
        const otherSelect = other.querySelector<HTMLSelectElement>(".theme-switcher-select")
        if (otherSelect) otherSelect.value = preset
      }
    }

    select.addEventListener("change", onChange)

    window.addCleanup(() => {
      select.removeEventListener("change", onChange)
    })
  }
})
