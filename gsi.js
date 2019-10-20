const http = require("http")

const config = require("./loadconfig")()
const remotenades = require("./remotenades.js")

const host = "localhost"

let oldPhase = false
let infernosOnMap = [] //initial molotov status
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

			if (config.nadeCollection) {
				remotenades.setMap(game.map.name)
			}
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

				for (let t in player.weapons) {
					if (player.weapons[t].name == "weapon_c4") {
						hasBomb = true
						bombActive = player.weapons[t].state == "active"
					}
				}

				playerArr.push({
					id: id,
					num: player.observer_slot,
					team: player.team,
					alive: player.state.health > 0,
					active: isActive,
					bomb: hasBomb,
					bombActive: bombActive,
					angle: angle,
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
			process.send({
				type: "smokes",
				data: smokes
			})
			process.send({
				type: "infernos",
				data: infernos
			})
			if (config.nadeCollection) {
				remotenades.event(game.grenades)
			}
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
				if (oldPhase == "over" && game.round.phase == "freezetime") {
					remotenades.send()
				}

				oldPhase = game.round.phase
			}
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
