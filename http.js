const http = require("http")

const port = 36363
const host = "localhost"

let hasConnection = false

let server = http.createServer(function(req, res) {
	if (req.method != "POST") {
		res.writeHead(405)
		return res.end("Only POST requests are allowed")
	}
	let body = ""

	req.on("data", data => {
		body += data
	})

	req.on("end", () => {
		res.end("")

		let game = JSON.parse(body)

		console.log(">", game)

		if (!hasConnection && game.provider) {
			let connObject = {
				status: "up"
			}

			if (game.player) {
				connObject.player = game.player.name
			}

			process.send({
				type: "connection",
				data: connObject
			})

			hasConnection = true
		}

		if (game.map) {
			process.send({
				type: "map",
				data: game.map.name
			})
		}
	})
})

server.listen(port, host)
console.log(`Active at http://${host}:${port}`)
