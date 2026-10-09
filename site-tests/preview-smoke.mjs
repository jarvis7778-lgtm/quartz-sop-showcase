import assert from "node:assert/strict"
import http from "node:http"
import handler from "serve-handler"
import { chromium } from "playwright"
const server = http.createServer((req, res) =>
  handler(req, res, { public: "preview/updated", cleanUrls: true }),
)
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" })
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on("pageerror", (e) => errors.push(e.message))
    await page.goto(base, { waitUntil: "networkidle" })
    assert.ok((await page.locator("h1").innerText()).includes("硬件"))
    if (width === 390) {
      // Mobile browser chrome collapses during scrolling, resizing the viewport.
      await page.evaluate(() => window.scrollTo(0, 400))
      await page.setViewportSize({ width, height: 760 })
      await page.waitForTimeout(400)
      assert.equal(
        await page.locator("#quartz-body").evaluate((el) => el.classList.contains("lock-scroll")),
        false,
      )
      assert.equal(
        await page.evaluate(() => document.documentElement.classList.contains("mobile-no-scroll")),
        false,
      )
      assert.ok(await page.locator(".center").evaluate((el) => el.getBoundingClientRect().left < 1))
    }
    for (const theme of ["notion", "carbon", "nocturne", "fieldnotes"]) {
      await page.locator(`[data-showcase-theme="${theme}"]`).click()
      assert.equal(await page.evaluate(() => document.body.dataset.themePreset), theme)
    }
    await page.locator('a[href*="tutorial/ch01-mcu-intro"]:visible').first().click()
    await page.waitForURL("**/tutorial/ch01-mcu-intro")
    await page.locator(".theme-switcher-select").selectOption("carbon")
    assert.equal(await page.evaluate(() => document.body.dataset.themePreset), "carbon")
    await page.reload({ waitUntil: "networkidle" })
    assert.equal(await page.evaluate(() => document.body.dataset.themePreset), "carbon")
    assert.match(await page.locator("#theme-fonts").getAttribute("href"), /IBM/)
    assert.deepEqual(errors, [])
    console.log(
      JSON.stringify({
        width,
        theme: "carbon",
        errors,
        scroll: await page.evaluate(() => document.documentElement.scrollWidth),
      }),
    )
    await page.close()
  }
} finally {
  await browser.close()
  server.close()
}
