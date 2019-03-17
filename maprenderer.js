const fs = require("fs")
const path = require("path")
const JSON5 = require("json5")
const renderer = require("electron").ipcRenderer

let mapData = {}
let currentMap = "none"

let drawBombsites = true

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

renderer.on("players", (event, players) => {
	if (currentMap == "none") return

	for (let player of players) {
		let percX = positionToPerc(player.position.x, mapData.offset.x)
		let percY = positionToPerc(player.position.y, mapData.offset.y)

		let playerElement  = document.getElementById("player" + player.num)
		let classes = ["player", player.team]

		if (!player.alive) {
			classes.push("dead")
		}

		if (player.bomb) {
			classes.push("bomb")
		}

		playerElement.className = classes.join(" ")
		playerElement.style.display = "block"

		playerElement.style.left = percX + "%"
		playerElement.style.bottom = percY + "%"
	}
})
