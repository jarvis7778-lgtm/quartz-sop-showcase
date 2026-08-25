// @ts-ignore
import themeSwitcherScript from "./scripts/themeswitcher.inline"
import styles from "./styles/themeswitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { allPresetsGoogleFontHref, themeRegistry } from "../../themes"

// Runtime visual-preset switcher. A native select keeps the control reliable on
// desktop, mobile, and after Quartz SPA navigation. Selecting one flips
// body.dataset.themePreset live (no rebuild), persists to localStorage, and
// survives navigation. The dark/light toggle stays independent.
const ThemeSwitcher: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "theme-switcher")}>
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
        <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996C18.043 15.281 20 13.324 20 10.855 20 6.012 16.42 2 12 2Z" />
      </svg>
      <label class="theme-switcher-label" for="theme-preset-select">
        主题
      </label>
      <select
        id="theme-preset-select"
        class="theme-switcher-select"
        aria-label="选择阅读主题"
        title="选择阅读主题"
      >
        {themeRegistry.map((manifest) => (
          <option
            value={manifest.id}
            data-theme-font-href={
              manifest.theme.fontOrigin === "googleFonts"
                ? allPresetsGoogleFontHref([manifest])
                : undefined
            }
            title={manifest.description}
          >
            {manifest.label}
          </option>
        ))}
      </select>
    </div>
  )
}

ThemeSwitcher.beforeDOMLoaded = themeSwitcherScript
ThemeSwitcher.css = styles

export default (() => ThemeSwitcher) satisfies QuartzComponentConstructor
