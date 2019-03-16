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

		// console.log(">", game)

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

		console.log("msg")
		console.log(JSON.stringify(game))
		if (game.allplayers) {
			let playerArr = []


			for (let i in game.allplayers) {
				if (!Number.isInteger(game.allplayers[i].observer_slot)) continue

				let player = game.allplayers[i]
				let pos = player.position.split(", ")
				let hasBomb = false

				for (let t in player.weapons) {
					if (player.weapons[t].name == "weapon_c4") {
						hasBomb = true
						break
					}
				}

				playerArr.push({
					num: player.observer_slot,
					team: player.team,
					alive: player.state.health > 0,
					bomb: hasBomb,
					position: {
						x: parseFloat(pos[0]),
						y: parseFloat(pos[1]),
						z: parseFloat(pos[2])
					}
				})
			}
			// console.log(playerArr)

			process.send({
				type: "players",
				data: playerArr
			})
		}
	})
})

server.listen(port, host)
console.info(`Active at http://${host}:${port}`)
