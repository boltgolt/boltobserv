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

	let players = []

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
			team: player.gameData.team,
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

		// if (player.gameData.observer_slot == 1) console.log(player);
	}

	sendEvent('players', players)
}
