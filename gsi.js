const http = require("http")

const config = require("./loadconfig")
const host = "localhost"

let oldPhase = false
let infernosOnMap = [] //initial molotov status
let flashbangsOnMap = []
let server = http.createServer((req, res) => {
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
			let smokes = []
			let nades = []
			let infernos = []
			let flashbangs = []
			for (let nadeID in game.grenades) {
				let nade = game.grenades[nadeID]

				if (nade.type == "smoke" && nade.velocity == "0.00, 0.00, 0.00") {
					let pos = nade.position.split(", ")
					smokes.push({
						id: nadeID,
						time: nade.effecttime,
						position: {
							x: parseFloat(pos[0]),
							y: parseFloat(pos[1]),
							z: parseFloat(pos[2])
						}
					})
				}
				if (nade.type == "flashbang" && parseFloat(nade.lifetime) >= 1.4) {
					let pos = nade.position.split(", ")
					flashbangs.push({
						id: nadeID,
						position: {
							x: parseFloat(pos[0]),
							y: parseFloat(pos[1]),
							z: parseFloat(pos[2])
						}
					})
					if (flashbangsOnMap.indexOf(nadeID) == -1) {flashbangsOnMap.push(nadeID)}
				}
				if (nade.type == "inferno") {
					if (!!nade.flames) {
						let flamesPos = []
						let flamesNum = Object.values(nade.flames).length
						for (var i = 0; i < flamesNum; i++) {
							flamesPos.push({
								x: parseFloat(Object.values(nade.flames)[i].split(", ")[0]),
								y: parseFloat(Object.values(nade.flames)[i].split(", ")[1]),
								z: parseFloat(Object.values(nade.flames)[i].split(", ")[2]),
							})
						}
						infernos.push({
							id: nadeID,
							flamesNum: flamesNum,
							flamesPosition: flamesPos
						})
						if (infernosOnMap.indexOf(nadeID) == -1 ) {infernosOnMap.push(nadeID)}
					}
					else{

					}
				}
			}
			for (let infernoOnMap of infernosOnMap) {
				if (!game.grenades[infernoOnMap]) {
					process.send({
						type: "infernoRemove",
						data: infernoOnMap
					})
				}// check if molotov exist in game
			}
			for (let flashbangOnMap of flashbangsOnMap) {
				if (!game.grenades[flashbangOnMap]) {
					process.send({
						type: "flashbangRemove",
						data: flashbangOnMap
					})
				}
			}
			process.send({
				type: "smokes",
				data: smokes
			})
			process.send({
				type: "infernos",
				data: infernos
			})
			process.send({
				type: "flashbangs",
				data: flashbangs
			})
		}

		if (game.round) {
			process.send({
				type: "round",
				data: game.round.phase
			})

			if (oldPhase == "over" && game.round.phase == "freezetime") {
					infernosOnMap = [] //clear molotov status every round
				}
			if (oldPhase != game.round.phase && config.nadeCollection) {
				oldPhase = game.round.phase
			}
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
})

server.listen(config.game.networkPort, host)
console.info(`GSI input expected at http://${host}:${config.game.networkPort}`)
