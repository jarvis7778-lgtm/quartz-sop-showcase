import { isValidPreset, THEME_PRESET_STORAGE_KEY } from "../../../themes/switcher"

function applyShowcasePreset(preset: string) {
  if (!isValidPreset(preset)) return

  document.documentElement.dataset.themePreset = preset
  document.body.dataset.themePreset = preset
  try {
    localStorage.setItem(THEME_PRESET_STORAGE_KEY, preset)
  } catch {
    // Storage can be unavailable in private browsing. The live switch still works.
  }

  for (const button of Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-showcase-theme]"),
  )) {
    const selected = button.dataset.showcaseTheme === preset
    button.setAttribute("aria-pressed", selected ? "true" : "false")
    const state = button.querySelector<HTMLElement>(".showcase-theme-state")
    if (state) state.textContent = selected ? "正在使用" : "应用主题"
  }

  document.dispatchEvent(new CustomEvent("themepresetchange", { detail: { preset } }))
  const savedTheme = document.documentElement.getAttribute("saved-theme")
  document.dispatchEvent(
    new CustomEvent("themechange", {
      detail: { theme: savedTheme === "dark" ? "dark" : "light" },
    }),
  )
}

document.addEventListener("nav", () => {
  const themeButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-showcase-theme]"),
  )
  if (themeButtons.length === 0) return

  const current = document.body.dataset.themePreset
  if (current) applyShowcasePreset(current)

  const listeners = themeButtons.map((button) => {
    const listener = () => {
      const preset = button.dataset.showcaseTheme
      if (preset) applyShowcasePreset(preset)
    }
    button.addEventListener("click", listener)
    return [button, listener] as const
  })

  window.addCleanup(() => {
    for (const [button, listener] of listeners) button.removeEventListener("click", listener)
  })
})
