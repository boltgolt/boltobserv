const http = require("http")

const remotenades = require("./remotenades.js")

const port = 36363
const host = "localhost"

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

		if (game.provider) {
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
		}

		if (game.map) {
			process.send({
				type: "map",
				data: game.map.name
			})
		}

		// console.log(JSON.stringify(game))
		if (game.allplayers) {
			let playerArr = []
			let context = {
				defusing: false
			}

			if (game.phase_countdowns) {
				if (game.phase_countdowns.phase == "defuse") {
					context.defusing = true
				}
			}

			for (let i in game.allplayers) {
				if (!Number.isInteger(game.allplayers[i].observer_slot)) continue

				const nadeIDs = ["weapon_smokegrenade", "weapon_flashbang", "weapon_hegrenade", "weapon_incgrenade", "weapon_smokegrenade"]
				let player = game.allplayers[i]
				let pos = player.position.split(", ")
				let hasBomb = false
				let bombActive = false
				let nadeActive = false

				for (let t in player.weapons) {
					if (player.weapons[t].name == "weapon_c4") {
						hasBomb = true
						bombActive = player.weapons[t].state == "active"
					}

					if (player.weapons[t].state == "active" && nadeIDs.includes(player.weapons[t].name)) {
						nadeActive = true
					}
				}

				playerArr.push({
					num: player.observer_slot,
					team: player.team,
					alive: player.state.health > 0,
					bomb: hasBomb,
					bombActive: bombActive,
					nadeActive: nadeActive,
					position: {
						x: parseFloat(pos[0]),
						y: parseFloat(pos[1]),
						z: parseFloat(pos[2])
					}
				})
			}

			process.send({
				type: "players",
				data: {
					context: context,
					players: playerArr
				}
			})
		}

		if (game.grenades) {
			let smokes = []
			let nades = []

			for (let nadeID in game.grenades) {
				let nade = game.grenades[nadeID]

				if (nade.type == "smoke" && nade.velocity == "0.00, 0.00, 0.00") {
					let pos = nade.position.split(", ")
					smokes.push({
						id: nadeID,
						timeLeft: nade.lifetime,
						position: {
							x: parseFloat(pos[0]),
							y: parseFloat(pos[1]),
							z: parseFloat(pos[2])
						}
					})
				}
			}

			process.send({
				type: "smokes",
				data: smokes
			})

			remotenades(game.grenades)
		}
	})
})

server.listen(port, host)
console.info(`Active at http://${host}:${port}`)
