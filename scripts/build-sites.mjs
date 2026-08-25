import { cp, mkdir, rm, writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
  })
}

await run("node", ["./quartz/bootstrap-cli.mjs", "build"], {
  env: { ...process.env, SITE_MODE: "static" },
})

await rm("dist", { recursive: true, force: true })
await mkdir("dist/client", { recursive: true })
await mkdir("dist/server", { recursive: true })
await cp("public", "dist/client", { recursive: true })

await writeFile(
  "dist/server/index.js",
  `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== "GET") return response

    const accept = request.headers.get("accept") || ""
    if (!accept.includes("text/html")) return response

    const url = new URL(request.url)
    const candidates = url.pathname.endsWith("/")
      ? [url.pathname + "index.html"]
      : [url.pathname + ".html", url.pathname + "/index.html"]

    for (const pathname of candidates) {
      const candidate = new URL(pathname, url)
      const fallback = await env.ASSETS.fetch(new Request(candidate, request))
      if (fallback.status !== 404) return fallback
    }
    return response
  },
}
`,
)

await writeFile(
  "dist/server/wrangler.json",
  `${JSON.stringify(
    {
      main: "index.js",
      compatibility_date: "2026-08-25",
      assets: {
        directory: "../client",
        binding: "ASSETS",
        html_handling: "auto-trailing-slash",
        not_found_handling: "404-page",
      },
    },
    null,
    2,
  )}\n`,
)

console.log("Prepared Sites-compatible static output in dist/.")
