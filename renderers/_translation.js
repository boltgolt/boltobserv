function sendEvent(type, data) {
	// Create a new event with the given event type
	let outev = new Event(type)
	// Add the data we got to the new event
	outev.data = data
	// Send the event to other scripts
	socket.element.dispatchEvent(outev)
}

function translateData(data) {
	if (global.currentMap != data.map) {
		sendEvent('map', data.map.name)
	}

	sendEvent('round', data.map.phase)

	let players = []
	let grenades = []

	for (let playerid in data.players) {
		let player = data.players[playerid]
		let pos = player.gameData.position.split(", ")
		let rawAngle = player.gameData.forward.split(", ")
		let angle = 0

		if (parseFloat(rawAngle[0]) > 0) {
			angle = 90 + parseFloat(rawAngle[1]) * -1 * 90
		}
		else {
			angle = 270 + parseFloat(rawAngle[1]) * 90
		}

		players.push({
			team: player.gameData.teamSide,
			num: player.gameData.observer_slot,
			health: player.gameData.state.health,
			bomb: data.bomb.state == 'carried' && playerid == data.bomb.player,
			active: player.observed,
			flashed: player.gameData.state.flashed,
			angle: angle,
			shooting: player.shoot ? true : false,
			position: {
				x: parseFloat(pos[0]),
				y: parseFloat(pos[1]),
				z: parseFloat(pos[2])
			}
		})

		for (let nadeid in player.deployedGrenades) {
			player.deployedGrenades[nadeid].id = parseInt(nadeid)
			grenades.push(player.deployedGrenades[nadeid])
		}
	}

	sendEvent('players', players)

	let smokes = []
	let infernos = []
	let flashbangs = []

	for (let nade of grenades) {
		if (nade.type == "smoke" && nade.velocity == "0.00000, 0.00000, 0.00000") {
			let pos = nade.position.split(", ")
			smokes.push({
				id: nade.id,
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
				id: nade.id,
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
					flamesPos.push({
						x: parseFloat(Object.values(nade.flames)[i].split(", ")[0]),
						y: parseFloat(Object.values(nade.flames)[i].split(", ")[1]),
						z: parseFloat(Object.values(nade.flames)[i].split(", ")[2]),
					})
				}
				infernos.push({
					id: nade.id,
					flamesNum: flamesNum,
					flamesPosition: flamesPos
				})
			}
		}
	}

	sendEvent('smokes', smokes)
	sendEvent('flashbangs', flashbangs)
	sendEvent('infernos', infernos)

	let bombPos = data.bomb.position.split(", ")

	sendEvent('bomb', {
		bomb: data.bomb.state,
		position: {
			x: parseFloat(bombPos[0]),
			y: parseFloat(bombPos[1])
		}
	})
}
