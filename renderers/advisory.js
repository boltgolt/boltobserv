// Advisories
//
// Determines if an advisory can be shown and prioritizes the most important one.

let global = require("./_global")

function playerOnSite(cords, rect) {
	return rect.x1 <= cords.x
			&& cords.x <= rect.x2
			&& rect.y1 <= cords.y
			&& cords.y <= rect.y2
}

global.renderer.on("players", (event, data) => {
	return
	if (global.currentMap == "none") return

	let advisory = {
		"type": "none",
		"player": "?"
	}

	let playersOnSites = []
	let ctsAlive = []
	let tsAlive = []

	for (let player of data.players) {

		if (player.alive) {
			if (player.team == "CT") {
				ctsAlive.push(player)
			}
			else {
				tsAlive.push(player)
			}
		}

		let onA = playerOnSite(player.position, mapData.bombsites.a)
		let onB = playerOnSite(player.position, mapData.bombsites.b)

		if (onA || onB) {
			playersOnSites.push(player)

			if (player.bombActive) {
				advisory.type = "holdingbomb" + (onA ? "A" : "B")
				advisory.player = player.num
			}
		}
	}

	if (ctsAlive.length == 1 && advisory.type == "none") {
		advisory.type = "solesurvivor"
		advisory.player = ctsAlive[0].num
	}

	if (tsAlive.length == 1 && advisory.type == "none") {
		advisory.type = "solesurvivor"
		advisory.player = tsAlive[0].num
	}

	if (data.context.defusing) {
		let ctsOnSites = playersOnSites.filter(player => player.team == "CT")

		advisory.type = "defuse"
		advisory.player = "?"

		if (ctsOnSites.length == 1) {
			advisory.player = ctsOnSites[0].num
		}
	}

	document.getElementById("advisory").className = advisory.type
	document.getElementById("advisory").children[0].innerHTML = advisory.player
})
