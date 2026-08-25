import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import handler from "serve-handler"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "preview")

// One static server per built preset. Ports are stable so bookmarks survive
// rebuilds. 9007-9009 are the three newest presets; 9002 stays free (legacy).
const presets = {
  current: 9001,
  notion: 9003,
  things: 9004,
  anuppuccin: 9005,
  bluetopaz: 9006,
  carbon: 9007,
  nocturne: 9008,
  fieldnotes: 9009,
}

function startServer(label, port, publicDir) {
  const server = http.createServer((req, res) => handler(req, res, { public: publicDir, cleanUrls: true }))

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.warn(`${label} skipped: :${port} is already in use`)
      return
    }
    console.error(`${label} failed on :${port}`, error)
  })

  server.listen(port, "0.0.0.0", () => console.log(`${label} -> :${port}`))
}

// The gallery port is optional: an unrelated local service may already own 9000.
// Individual preset servers must still start in that case.
startServer("gallery", 9000, root)

for (const [name, port] of Object.entries(presets)) {
  startServer(name, port, `${root}/${name}`)
}
