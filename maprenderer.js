const renderer = require("electron").ipcRenderer

const mapData = {
	de_inferno: {
		resolution: 4.91,
		offset: {
			x: 2100,
			y: 1090
		}
	}
}

let currentMap = "none"

renderer.on("map", (event, map) => {
	if (currentMap == map) return

	currentMap = map
	document.title = "Boltobserv - " + map
	document.getElementById("radar").src = `../img/maps/${map}.png`
})

renderer.on("players", (event, players) => {
	if (currentMap == "none") return

	for (let player of players) {
		// The position of the player in game, with the bottom left corner as origin (0,0)
		let gamePosition = {
			x: player.position.x + mapData[currentMap].offset.x,
			y: player.position.y + mapData[currentMap].offset.y
		}

		// The position of the player relative to an 1024x1014 pixel grid
		let pixelPosition = {
			x: gamePosition.x / mapData[currentMap].resolution,
			y: gamePosition.y / mapData[currentMap].resolution
		}

		// The position of the player as an persentage for any size
		let percentPosition = {
			x: pixelPosition.x / 1024 * 100,
			y: pixelPosition.y / 1024 * 100
		}

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

		playerElement.style.left = percentPosition.x + "%"
		playerElement.style.bottom = percentPosition.y + "%"
	}
})
