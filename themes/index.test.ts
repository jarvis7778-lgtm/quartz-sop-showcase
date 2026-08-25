import test, { describe } from "node:test"
import assert from "node:assert"
import {
  themeRegistry,
  themePresetNames,
  defaultThemePreset,
  getThemeManifest,
  createThemePreset,
  validateThemeRegistry,
  buildAllPresetTokens,
  allPresetsGoogleFontHref,
  type ThemeManifest,
} from "./index"

const EXPECTED_IDS = [
  "current",
  "notion",
  "things",
  "anuppuccin",
  "bluetopaz",
  "carbon",
  "nocturne",
  "fieldnotes",
] as const

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

// A CSS ident that can appear unquoted in an attribute selector body[data-theme-preset=<id>]
// must match a conservative slug: lowercase alnum + dashes, starting with a letter.
const CSS_SAFE_ID = /^[a-z][a-z0-9-]*$/

describe("theme registry", () => {
  test("registers exactly the 8 expected presets", () => {
    const ids = themeRegistry.map((m) => m.id).sort()
    assert.deepEqual(ids, [...EXPECTED_IDS].sort())
    assert.deepEqual([...themePresetNames].sort(), [...EXPECTED_IDS].sort())
  })

  test("every manifest carries id, label, description and a Theme", () => {
    for (const manifest of themeRegistry) {
      assert.equal(typeof manifest.id, "string", `${manifest.id} id`)
      assert.ok(manifest.label && manifest.label.length > 0, `${manifest.id} label`)
      assert.ok(
        manifest.description && manifest.description.length > 0,
        `${manifest.id} description`,
      )
      assert.ok(manifest.theme, `${manifest.id} theme`)
      assert.ok(manifest.theme.colors.lightMode, `${manifest.id} lightMode`)
      assert.ok(manifest.theme.colors.darkMode, `${manifest.id} darkMode`)
      assert.ok(manifest.theme.typography.header, `${manifest.id} header font`)
    }
  })

  test("ids are unique", () => {
    const ids = themeRegistry.map((m) => m.id)
    assert.equal(new Set(ids).size, ids.length, "duplicate ids present")
  })

  test("ids are CSS-safe (usable unquoted in an attribute selector)", () => {
    for (const manifest of themeRegistry) {
      assert.match(manifest.id, CSS_SAFE_ID, `${manifest.id} is not CSS-safe`)
    }
  })

  test("required color tokens present for both light and dark modes", () => {
    for (const manifest of themeRegistry) {
      for (const mode of ["lightMode", "darkMode"] as const) {
        const scheme = manifest.theme.colors[mode] as unknown as Record<string, string>
        for (const token of REQUIRED_COLOR_TOKENS) {
          assert.ok(
            typeof scheme[token] === "string" && scheme[token].length > 0,
            `${manifest.id}.${mode}.${token} missing`,
          )
        }
      }
    }
  })

  test("default preset id is valid and present in the registry", () => {
    assert.ok(themePresetNames.includes(defaultThemePreset), "default not in registry")
    assert.ok(getThemeManifest(defaultThemePreset), "default manifest missing")
  })

  test("getThemeManifest returns the matching manifest and undefined for unknown ids", () => {
    const m = getThemeManifest("nocturne")
    assert.equal(m?.id, "nocturne")
    assert.equal(getThemeManifest("does-not-exist" as any), undefined)
  })

  test("createThemePreset returns the Theme tokens for a preset and rejects unknown ids", () => {
    const theme = createThemePreset("current")
    assert.ok(theme.colors.lightMode.light)
    assert.equal(theme.fontOrigin, "googleFonts")
    assert.throws(() => createThemePreset("unknown"), /unknown theme preset/i)
  })

  test("validateThemeRegistry passes for the shipped registry", () => {
    // Should not throw and should report zero problems.
    const problems = validateThemeRegistry(themeRegistry)
    assert.deepEqual(problems, [], `registry problems: ${problems.join(", ")}`)
  })

  test("validateThemeRegistry flags duplicate ids, bad ids, and missing tokens", () => {
    const good = getThemeManifest("current")!
    // duplicate id
    assert.ok(validateThemeRegistry([good, good]).length > 0, "duplicate not flagged")
    // css-unsafe id
    const badId = { ...good, id: "Bad Id!" } as ThemeManifest
    assert.ok(
      validateThemeRegistry([badId]).some((p) => /id/i.test(p)),
      "bad id not flagged",
    )

    const missingToken = {
      ...good,
      id: "missing-token",
      theme: {
        ...good.theme,
        colors: {
          ...good.theme.colors,
          lightMode: {
            ...good.theme.colors.lightMode,
            secondary: "",
          },
        },
      },
    } as ThemeManifest
    assert.ok(
      validateThemeRegistry([missingToken]).some((p) => /secondary/.test(p)),
      "missing required token not flagged",
    )
  })
})

describe("runtime token emission", () => {
  test("buildAllPresetTokens emits a scoped block for every preset id, both modes", () => {
    const css = buildAllPresetTokens(themeRegistry)
    for (const manifest of themeRegistry) {
      // light-mode scoped block
      assert.ok(
        css.includes(`body[data-theme-preset="${manifest.id}"]`),
        `missing light scope for ${manifest.id}`,
      )
      // dark-mode scoped block (paired with saved-theme=dark)
      assert.match(
        css,
        new RegExp(
          `\\[data-theme-preset="${manifest.id}"\\][^{]*\\bsaved-theme="dark"|saved-theme="dark"[^{]*\\[data-theme-preset="${manifest.id}"\\]`,
        ),
        `missing dark scope for ${manifest.id}`,
      )
      // carries the color custom properties and the font custom properties
      assert.ok(
        css.includes(manifest.theme.colors.lightMode.secondary),
        `light secondary ${manifest.id}`,
      )
      assert.ok(
        css.includes(manifest.theme.colors.darkMode.secondary),
        `dark secondary ${manifest.id}`,
      )
      assert.ok(css.includes("--headerFont"), "no --headerFont var emitted")
    }
  })

  test("allPresetsGoogleFontHref returns a single deduplicated css2 request covering all families", () => {
    const href = allPresetsGoogleFontHref(themeRegistry)
    assert.match(href, /^https:\/\/fonts\.googleapis\.com\/css2\?/)
    // a family that appears in multiple presets (Inter) must appear exactly once
    const interCount = (href.match(/family=Inter(?::|&|$)/g) ?? []).length
    assert.equal(interCount, 1, "Inter not deduplicated in combined font request")
    // Merge every requested axis for a shared family rather than taking the
    // first occurrence. Inter is a Notion header (400/700) and a Things body
    // (400/600 + italics), so the combined request must include all three.
    assert.ok(href.includes("Inter:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700"), href)
    // families unique to a single preset must still be present
    assert.ok(href.includes("Fraunces"), "fieldnotes header font missing")
    assert.ok(
      href.includes("Space+Grotesk") || href.includes("Space Grotesk"),
      "nocturne font missing",
    )
  })
})
