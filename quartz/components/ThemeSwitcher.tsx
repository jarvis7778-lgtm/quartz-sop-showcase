// @ts-ignore
import themeSwitcherScript from "./scripts/themeswitcher.inline"
import styles from "./styles/themeswitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { allPresetsGoogleFontHref, themeRegistry } from "../../themes"

// Runtime visual-preset switcher. Renders a labeled button that opens a menu of
// every registered theme manifest. Selecting one flips body.dataset.themePreset
// live (no rebuild), persists to localStorage, and survives SPA navigation. The
// dark/light toggle stays independent — this only changes the visual preset.
const ThemeSwitcher: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "theme-switcher")}>
      <button
        class="theme-switcher-button"
        type="button"
        aria-haspopup="listbox"
        aria-controls="theme-preset-listbox"
        aria-expanded="false"
        aria-label="Change theme preset"
        title="Change theme preset"
      >
        <svg
          class="theme-switcher-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          {/* palette / swatches glyph */}
          <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996C18.043 15.281 20 13.324 20 10.855 20 6.012 16.42 2 12 2Z" />
        </svg>
        <span class="theme-switcher-label">Theme</span>
      </button>
      <ul
        id="theme-preset-listbox"
        class="theme-switcher-menu"
        role="listbox"
        aria-label="Theme presets"
        hidden
      >
        {themeRegistry.map((manifest) => (
          <li role="none">
            <button
              type="button"
              role="option"
              class="theme-switcher-option"
              data-theme-value={manifest.id}
              data-theme-font-href={
                manifest.theme.fontOrigin === "googleFonts"
                  ? allPresetsGoogleFontHref([manifest])
                  : undefined
              }
              aria-selected="false"
              title={manifest.description}
            >
              <span class="theme-switcher-option-label">{manifest.label}</span>
              <span class="theme-switcher-check" aria-hidden="true">
                ✓
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

ThemeSwitcher.beforeDOMLoaded = themeSwitcherScript
ThemeSwitcher.css = styles

export default (() => ThemeSwitcher) satisfies QuartzComponentConstructor
