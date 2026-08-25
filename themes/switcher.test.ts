import test, { describe } from "node:test"
import assert from "node:assert"
import { isValidPreset, resolveThemePreset, THEME_PRESET_STORAGE_KEY } from "./switcher"
import { defaultThemePreset, themePresetNames } from "./index"

describe("theme switcher pure helpers", () => {
  test("isValidPreset accepts every registered preset", () => {
    for (const id of themePresetNames) {
      assert.ok(isValidPreset(id), `${id} should be valid`)
    }
  })

  test("isValidPreset rejects unknown / malformed values", () => {
    assert.ok(!isValidPreset("nope"))
    assert.ok(!isValidPreset(""))
    assert.ok(!isValidPreset(null))
    assert.ok(!isValidPreset(undefined))
    assert.ok(!isValidPreset(42 as unknown as string))
  })

  test("resolveThemePreset returns a saved valid preset over the build default", () => {
    assert.equal(resolveThemePreset("nocturne", "current"), "nocturne")
  })

  test("resolveThemePreset falls back to build default for an invalid saved value", () => {
    assert.equal(resolveThemePreset("garbage", "current"), "current")
    assert.equal(resolveThemePreset(null, "carbon"), "carbon")
    assert.equal(resolveThemePreset(undefined, "fieldnotes"), "fieldnotes")
  })

  test("resolveThemePreset falls back to the registry default when the given default is itself invalid", () => {
    // A caller passing a bogus build default must still yield a real preset,
    // never an invalid id that would leave the body unstyled.
    const resolved = resolveThemePreset(null, "not-a-real-default")
    assert.ok(isValidPreset(resolved))
    assert.equal(resolved, defaultThemePreset)
  })

  test("storage key is namespaced and distinct from the dark/light key 'theme'", () => {
    assert.equal(typeof THEME_PRESET_STORAGE_KEY, "string")
    assert.ok(THEME_PRESET_STORAGE_KEY.length > 0)
    assert.notEqual(THEME_PRESET_STORAGE_KEY, "theme")
  })
})
