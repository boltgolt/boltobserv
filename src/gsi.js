const http = require("http")
const config = require("./loadconfig")

let server = http.createServer(handleRequest)

server.on("error", err => {
	console.error("GSI server error:", err)
})

server.listen(config.game.networkPort, config.game.host, () => {
	console.info(`GSI input expected at http://${config.game.host}:${config.game.networkPort}`)
})

function handleRequest(req, res) {
	if (req.method != "POST") {
		res.writeHead(405)
		return res.end("Boltobserv running\nPlease POST GSI data here")
	}

	// Start with an enpty body
	let body = ""
	// Append incomming data to body
	req.on("data", data => body += data)


	// On end if packet data
	req.on("end", () => {
		// Send back empty response immediatly
		res.end("")

		// Patch incomming JSON to convert large integers to strings
		body = body.replace(/"owner": ([0-9]{10,})/g, '"owner": "$1"')
		// Parse JSON packet
		let game = JSON.parse(body)

		if (game.provider) {
			let connObject = {
				status: "up"
			}

			if (game.player) {
				if (game.player.activity != "playing") {
					connObject.player = game.player.name
				}
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

		if (game.allplayers) {
			let playerArr = []

			for (let id in game.allplayers) {
				if (!Number.isInteger(game.allplayers[id].observer_slot)) continue

				let player = game.allplayers[id]
				let pos = player.position.split(", ")
				let angle = 0
				let hasBomb = false
				let bombActive = false
				let isActive = false
				let rawAngle = player.forward.split(", ")
				let ammo = {}

				if (parseFloat(rawAngle[0]) > 0) {
					angle = 90 + parseFloat(rawAngle[1]) * -1 * 90
				}
				else {
					angle = 270 + parseFloat(rawAngle[1]) * 90
				}

				if (game.player) {
					if (game.player.observer_slot == player.observer_slot) {
						isActive = true
					}
				}

				for (let id in player.weapons) {
					// The player has the bomb in their inventory
					if (player.weapons[id].name == "weapon_c4") {
						hasBomb = true
						// The player has the bomb in their hands
						bombActive = player.weapons[id].state == "active"
					}

					// Save the amma in each gun to know when the player is shooting
					else if (player.weapons[id].ammo_clip) {
						ammo[player.weapons[id].name] = player.weapons[id].ammo_clip
					}
				}

				playerArr.push({
					id: id,
					num: player.observer_slot,
					name: player.name,
					team: player.team,
					health: player.state.health,
					active: isActive,
					flashed: player.state.flashed,
					bomb: hasBomb,
					bombActive: bombActive,
					angle: angle,
					ammo: ammo,
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
					players: playerArr
				}
			})
		}

		if (game.grenades) {
			let grenades = {
				smokes: [],
				infernos: [],
				flashbangs: [],
				projectiles: []
			}

			for (let nadeID in game.grenades) {
				let nade = game.grenades[nadeID]

				if (nade.type == "smoke" && nade.effecttime != '0.000') {
					let pos = nade.position.split(", ")
					let owner = game.allplayers[nade.owner]

					if (!owner) continue
					let team = owner.team ? owner.team : ""

					grenades.smokes.push({
						id: nadeID,
						time: parseFloat(nade.effecttime),
						team: team,
						position: {
							x: parseFloat(pos[0]),
							y: parseFloat(pos[1]),
							z: parseFloat(pos[2])
						}
					})
				}

				if (nade.type == "flashbang" && parseFloat(nade.lifetime) >= 1.4) {
					let pos = nade.position.split(", ")
					grenades.flashbangs.push({
						id: nadeID,
						position: {
							x: parseFloat(pos[0]),
							y: parseFloat(pos[1]),
							z: parseFloat(pos[2])
						}
					})
				}

				else if (nade.type == "inferno") {
					if (nade.flames) {
						let flamesPos = []
						let flamesNum = Object.values(nade.flames).length

						for (var i = 0; i < flamesNum; i++) {
							let pos = Object.values(nade.flames)[i].split(", ")
							flamesPos.push({
								x: parseFloat(pos[0]),
								y: parseFloat(pos[1]),
								z: parseFloat(pos[2])
							})
						}

						grenades.infernos.push({
							id: nadeID,
							flamesNum: flamesNum,
							flamesPosition: flamesPos
						})
					}
				}

				else if (nade.type != "decoy" && nade.velocity != "0.000, 0.000, 0.000" && (nade.type != "smoke" || nade.effecttime == '0.000')) {
					let pos = nade.position.split(", ")
					let owner = game.allplayers[nade.owner]

					if (!owner) continue
					let team = owner.team ? owner.team : ""

					grenades.projectiles.push({
						id: nade.type + nadeID,
						type: nade.type,
						team: team,
						position: {
							x: parseFloat(pos[0]),
							y: parseFloat(pos[1]),
							z: parseFloat(pos[2])
						}
					})
				}
			}

			// Emit an event for every type of grenade
			for (let type in grenades) {
				process.send({
					type: type,
					data: grenades[type]
				})
			}
		}

		if (game.round) {
			process.send({
				type: "round",
				data: game.round.phase
			})
		}

		if (game.phase_countdowns) {
			process.send({
				type: "canbuy",
				data: !((['live', 'bomb', 'defuse', 'over'].includes(game.phase_countdowns.phase)) && parseFloat(game.phase_countdowns.phase_ends_in) < 95)
			})
		}

		if (game.bomb) {
			let pos = game.bomb.position.split(", ")

			process.send({
				type: "bomb",
				data: {
					state: game.bomb.state,
					player: game.bomb.player,
					position: {
						x: parseFloat(pos[0]),
						y: parseFloat(pos[1]),
						z: parseFloat(pos[2])
					}
				}
			})
		}
	})
}
