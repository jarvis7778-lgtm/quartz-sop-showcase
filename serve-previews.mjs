import http from "node:http"
import handler from "serve-handler"

const root = "/home/lyy/code/quartz-sop-template/preview"
const presets = { current: 9001, minimal: 9002, notion: 9003, things: 9004, anuppuccin: 9005, bluetopaz: 9006 }

for (const [name, port] of Object.entries(presets)) {
  http
    .createServer((req, res) => handler(req, res, { public: `${root}/${name}`, cleanUrls: true }))
    .listen(port, "0.0.0.0", () => console.log(`${name} -> :${port}`))
}
