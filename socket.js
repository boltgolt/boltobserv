const fs = require("fs")
const path = require("path")
const WebSocket = require("ws")

const config = require("./loadconfig")()
const wss = new WebSocket.Server({
	port: config.browser.ports.socket
})

let scripts = []

// Get a list of available renderers
let renderers = fs.readdirSync(path.join(__dirname, "renderers"))

for (let renderer of renderers) {
	// Skip renderers that start with a "_", as they are only helpers
	if (renderer.slice(0, 1) == "_") continue
	// Load in the render module
	scripts.push(renderer)
}


wss.on("connection", ws => {
	ws.send(JSON.stringify({
		type: "welcome",
		data: {
			scripts: scripts,
			config: {
				radar: config.radar,
				autozoom: config.autozoom
			}
		}
	}))
})

process.on("message", data => {
	let string = JSON.stringify(data)

	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(string)
		}
	})
})
