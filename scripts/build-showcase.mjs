import { cp, mkdir, rm, writeFile } from "node:fs/promises"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const run = promisify(execFile)
const presets = [
  "current",
  "notion",
  "things",
  "anuppuccin",
  "bluetopaz",
  "carbon",
  "nocturne",
  "fieldnotes",
]

await run("node", ["./quartz/bootstrap-cli.mjs", "build"], { env: process.env })
await rm("preview", { recursive: true, force: true })
await mkdir("preview", { recursive: true })

const cards = []
for (const preset of presets) {
  const target = `preview/${preset}`
  await cp("public", target, { recursive: true })
  await writeFile(`${target}/_headers`, `/*\n  Cache-Control: public, max-age=0, must-revalidate\n`)
  cards.push(`<li><a href="./${preset}/?theme=${preset}">${preset}</a></li>`)
}

await writeFile(
  "preview/index.html",
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>cfour themes</title><h1>cfour theme showcase</h1><ul>${cards.join("")}</ul>`,
)
console.log(`Built ${presets.length} showcase entries from one Quartz build.`)
