const fs = require("fs")
const path = require("path")
const JSON5 = require("json5")
const renderer = require("electron").ipcRenderer

const config = require("./loadconfig")()

let mapData = {}
let currentMap = "none"

for (let playerElem of document.getElementsByClassName("player")) {
	playerElem.style.transform = `scale(${config.radar.playerDotScale})  translate(-50%, -50%)`
}

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

	if (config.radar.hideAdvisories) {
		document.getElementById("advisory").style.display = "none"
	}
	else {
		document.getElementById("advisory").style.left = mapData.advisoryPosition.x + "%"
		document.getElementById("advisory").style.bottom = mapData.advisoryPosition.y + "%"
		document.getElementById("advisory").style.display = "block"
	}

	function drawSite(element, cords) {
		element.style.display = "block"

		element.style.left = positionToPerc(cords.x1, mapData.offset.x) + "%"
		element.style.bottom = positionToPerc(cords.y1, mapData.offset.y) + "%"

		// Get the height and with by getting the distance between the points and converting it to an percentage
		element.style.width = ((cords.x2 - cords.x1) / mapData.resolution / 1024 * 100) + "%"
		element.style.height = ((cords.y2 - cords.y1) / mapData.resolution / 1024 * 100) + "%"
	}

	if (config.debug.drawBombsites) {
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
			playerPos[player.num].lock = true
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

		playerPos[player.num].x = positionToPerc(player.position.x, mapData.offset.x)
		playerPos[player.num].y = positionToPerc(player.position.y, mapData.offset.y)
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
	function fadeIn(smokeElement) {
		setTimeout(() => {
			smokeElement.className = "smokeEntity show"
		}, 25)
	}

	function remove(smokeElement) {
		setTimeout(() => {
			smokeElement.outerHTML = ""
		}, 2000)
	}

	let drawnSmokes = []

	for (let smoke of smokes) {
		let smokeElement = document.getElementById("smoke" + smoke.id)

		if (!smokeElement) {
			smokeElement = document.createElement("div")
			smokeElement.id = "smoke" + smoke.id
			smokeElement.className = "smokeEntity hide"

			smokeElement.style.height = smokeElement.style.width = 290 / mapData.resolution / 1024 * 100 + "%"

			document.getElementById("smokes").appendChild(smokeElement)

			fadeIn(smokeElement)
		}

		drawnSmokes.push()

		let percOffset  = parseFloat(smokeElement.style.height) / 2

		smokeElement.style.left = positionToPerc(smoke.position.x, mapData.offset.x) + "%"
		smokeElement.style.bottom = positionToPerc(smoke.position.y, mapData.offset.y) - percOffset + "%"

		if (smoke.time > 15 && smokeElement.className != "smokeEntity fading") {
			smokeElement.className = "smokeEntity fading"
		}

		if (smoke.time > 16.4 && smokeElement.className != "smokeEntity fading hide") {
			smokeElement.className = "smokeEntity fading hide"
			remove(smokeElement)
		}
	}
})

let playerPos = []
for (var i = 0; i < 10; i++) {
	playerPos.push({
		x: null,
		y: null,
		lock: false
	})
}

let playerBuffers = [[], [], [], [], [], [], [], [], [], []]

setInterval(() => {
	for (let num in playerBuffers) {
		if (playerPos[num].x != null && !playerPos[num].lock) {
			playerBuffers[num].unshift({
				x: playerPos[num].x,
				y: playerPos[num].y
			})
			playerBuffers[num] = playerBuffers[num].slice(0, config.radar.playerSmoothing)
		}

		let bufferPercX = (playerBuffers[num].reduce((prev, curr) => prev + curr.x, 0) / (playerBuffers[num].length))
		let bufferPercY = (playerBuffers[num].reduce((prev, curr) => prev + curr.y, 0) / (playerBuffers[num].length))

		let playerElement  = document.getElementById("player" + num)
		playerElement.style.left = bufferPercX + "%"
		playerElement.style.bottom = bufferPercY + "%"
	}
}, 10)

let gamePhase = "freezetime"
renderer.on("round", (event, phase) => {
	// Round has restared
	if ((phase == "freezetime" && gamePhase == "over") || (phase == "live" && gamePhase == "over")) {
		for (let num in playerBuffers) {
			playerBuffers[num] = []
			playerPos[num] = {
				x: null,
				y: null,
				lock: false
			}
		}
		
		
	}


	gamePhase = phase
})

let playersAlive = []

renderer.on("players", (event, data) => {
	if (currentMap == "none") return

	let foundArray = []

	for (let player of data.players) {
		if (!player.alive) continue

		foundArray.push({
			x: positionToPerc(player.position.x, mapData.offset.x),
			y: positionToPerc(player.position.y, mapData.offset.y)
		})
	}

	playersAlive = foundArray
})

let radarStyle = document.getElementById("container").style
let radarQueues = {
	scale: [1, 1, 1, 1, 1, 1],
	x: [0, 0, 0, 0, 0, 0],
	y: [0, 0, 0, 0, 0, 0]
}

setInterval(() => {
	let bounds = {
		x: {
			min: 100,
			max: 0
		},
		y: {
			min: 100,
			max: 0
		}
	}

	if (!config.autozoom.enable) return

	for (let player of playersAlive) {
		if (bounds.x.min > player.x) bounds.x.min = player.x
		if (bounds.x.max < player.x) bounds.x.max = player.x
		if (bounds.y.min > player.y) bounds.y.min = player.y
		if (bounds.y.max < player.y) bounds.y.max = player.y
	}

	let radarScale = 1 + (1 - Math.max(bounds.x.max - bounds.x.min, bounds.y.max - bounds.y.min) / 100)

	// Do not zoom if the scale seems to have been calculated with 0 data
	if (radarScale === 3) return

	// Limit the radar scale to base size, and keep a 20% buffer around the players
	radarScale = Math.max(1, radarScale - config.autozoom.padding)

	let radarX = (((bounds.x.max + bounds.x.min) / 2) - 50) * -1
	let radarY = ((bounds.y.max + bounds.y.min) / 2) - 50


	radarQueues.scale.unshift(radarScale)
	radarQueues.scale = radarQueues.scale.slice(0, config.autozoom.smoothing)
	radarQueues.x.unshift(radarX)
	radarQueues.x = radarQueues.x.slice(0, config.autozoom.smoothing)
	radarQueues.y.unshift(radarY)
	radarQueues.y = radarQueues.y.slice(0, config.autozoom.smoothing)

	let avgScale = radarQueues.scale.reduce((sum, el) => sum + el, 0) / radarQueues.scale.length
	let avgX = radarQueues.x.reduce((sum, el) => sum + el, 0) / radarQueues.x.length
	let avgY = radarQueues.y.reduce((sum, el) => sum + el, 0) / radarQueues.y.length

	radarStyle.transform = `scale(${avgScale}) translate(${avgX}%, ${avgY}%)`
}, 25)
