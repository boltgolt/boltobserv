const fs = require("fs")
const path = require("path")
const WebSocket = require("ws")

const config = require("./loadconfig")
const wss = new WebSocket.Server({
	port: config.browser.ports.socket
})

// Will contain the filenames of all rendered scripts
let scripts = []
// Get a list of available renderers
let renderers = fs.readdirSync(path.join(__dirname, "renderers"))

for (let renderer of renderers) {
	// Skip renderers that start with a "_", as they are only helpers
	if (renderer.slice(0, 1) == "_") continue
	// Load in the render module
	scripts.push(renderer)
}

// When a new connection is established
wss.on("connection", ws => {
	// Send a packet so the client has a config and knows what scripts to load
	ws.on("message", message => {
		if (message === "requestWelcome") {
			ws.send(JSON.stringify({
				type: "welcome",
				data: {
					scripts: scripts,
					config: {
						browser: config.browser,
						radar: config.radar,
						autozoom: config.autozoom,
						vertIndicator: config.vertIndicator,
					}
				}
			}))
		}
	})
})

// When a packet needs to be sent
process.on("message", data => {
	// Format the package as a string
	let string = JSON.stringify(data)

	// Send it to all open connections
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(string)
		}
	})
})
