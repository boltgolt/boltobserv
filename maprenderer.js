const fs = require("fs")
const path = require("path")
const JSON5 = require("json5")
const renderer = require("electron").ipcRenderer

let mapData = {}
let currentMap = "none"
let locBufferX = [[], [], [], [], [], [], [], [], [], []]
let locBufferY = [[], [], [], [], [], [], [], [], [], []]

let drawBombsites = false

/**
 * Convert in-game position units to radar percentages
 * @param  {float} pos    In-game position
 * @param  {float} offset Map offest for the right dimension
 * @return {float}        Relative radar percentage
 */
function positionToPerc(pos, offset) {
	// The position of the player in game, with the bottom left corner as origin (0,0)
	let gamePosition = pos + offset
	// The position of the player relative to an 1024x1014 pixel grid
	let pixelPosition = gamePosition / mapData.resolution
	// The position of the player as an percentage for any size
	return pixelPosition / 1024 * 100
}

renderer.on("map", (event, map) => {
	if (currentMap == map) return

	let metaPath = path.join(__dirname, "maps", map, "meta.json5")

	if (!fs.existsSync(metaPath)) {
		document.getElementById("unknownMap").style.display = "flex"
		document.getElementById("unknownMap").children[0].innerHTML = "Unsupported map " + map
		return
	}

	document.getElementById("unknownMap").style.display = "none"

	currentMap = map
	document.title = "Boltobserv - " + map
	document.getElementById("radar").src = `../maps/${map}/radar.png`

	mapData = JSON5.parse(fs.readFileSync(metaPath, "utf8"))

	document.getElementById("advisory").style.left = mapData.advisoryPosition.x + "%"
	document.getElementById("advisory").style.bottom = mapData.advisoryPosition.y + "%"
	document.getElementById("advisory").style.display = "block"

	function drawSite(element, cords) {
		element.style.display = "block"

		element.style.left = positionToPerc(cords.x1, mapData.offset.x) + "%"
		element.style.bottom = positionToPerc(cords.y1, mapData.offset.y) + "%"

		// Get the height and with by getting the distance between the points and converting it to an percentage
		element.style.width = ((cords.x2 - cords.x1) / mapData.resolution / 1024 * 100) + "%"
		element.style.height = ((cords.y2 - cords.y1) / mapData.resolution / 1024 * 100) + "%"
	}

	if (drawBombsites) {
		drawSite(document.getElementById("siteA"), mapData.bombsites.a)
		drawSite(document.getElementById("siteB"), mapData.bombsites.b)
	}
})

renderer.on("players", (event, data) => {
	if (currentMap == "none") return

	function playerOnSite(cords, rect) {
		return rect.x1 <= cords.x
				&& cords.x <= rect.x2
				&& rect.y1 <= cords.y
				&& cords.y <= rect.y2
	}

	let advisory = {
		"type": "none",
		"player": "?"
	}

	let playersOnSites = []
	let ctsAlive = []
	let tsAlive = []

	for (let player of data.players) {
		let playerElement  = document.getElementById("player" + player.num)
		let classes = ["player", player.team]

		if (!player.alive) {
			classes.push("dead")
		}
		else {
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

		if (player.bomb) {
			classes.push("bomb")
		}
		if (player.nadeActive) {
			classes.push("nade")
		}

		playerElement.className = classes.join(" ")
		playerElement.style.display = "block"

		let percX = positionToPerc(player.position.x, mapData.offset.x)
		let percY = positionToPerc(player.position.y, mapData.offset.y)

		locBufferX[player.num].unshift(percX)
		locBufferY[player.num].unshift(percY)

		locBufferX[player.num] = locBufferX[player.num].slice(0, 2)
		locBufferY[player.num] = locBufferY[player.num].slice(0, 2)

		let bufferPercX = (locBufferX[player.num].reduce((prev, curr) => prev + curr, 0) / (locBufferX[player.num].length))
		let bufferPercY = (locBufferY[player.num].reduce((prev, curr) => prev + curr, 0) / (locBufferY[player.num].length))

		playerElement.style.left = bufferPercX + "%"
		playerElement.style.bottom = bufferPercY + "%"
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

renderer.on("smokes", (event, smokes) => {
	for (let smoke of smokes) {
		let smokeElement = document.getElementById("smoke" + smoke.id)

		if (!smokeElement) {
			smokeElement = document.createElement("div")
			smokeElement.id = "smoke" + smoke.id

			smokeElement.style.height = 288 / mapData.resolution / 1024 * 100 + "%"
			smokeElement.style.width = 288 / mapData.resolution / 1024 * 100 + "%"

			document.getElementById("smokes").appendChild(smokeElement)
		}

		smokeElement.style.left = positionToPerc(smoke.position.x, mapData.offset.x) + "%"
		smokeElement.style.bottom = positionToPerc(smoke.position.y, mapData.offset.y) + "%"
	}
})
