// Shared render object
//
// Provides shared variables and functions for all renderers.

module.exports = {
	renderer: require("electron").ipcRenderer,
	config: require("../loadconfig")(),

	mapData: {},
	currentMap: "none",
	// The last known game phase
	gamePhase: "freezetime",

	playerPos: [],
	playerBuffers: [],
	playerElements: [],

	/**
	 * Convert in-game position units to radar percentages
	 * @param  {Float} pos    In-game position
	 * @param  {Float} offset Map offset
	 * @param  {Array} options  The y position if this position should be translated in a split map
	 * @return {Float}        Relative radar percentage
	 */
	positionToPerc: (pos, offset, options) => {
		// The position of the player in game, with the bottom left corner as origin (0,0)
		let gamePosition = pos + offset
		// The position of the player relative to an 1024x1014 pixel grid
		let pixelPosition = gamePosition / module.exports.mapData.resolution
		// The position of the player as an percentage for any size
		let precPosition = pixelPosition / 1024 * 100


		if (typeof options == "object" && module.exports.mapData.splits.length > 0) {
			for (let split of module.exports.mapData.splits) {
				console.log(options[1], split.bounds.bottom, split.bounds.top)
				if (options[1] > split.bounds.bottom && options[1] < split.bounds.top) {
					precPosition += split.offset[options[0]]
				}
			}
		}

		return precPosition
	}
}

// Fill position and buffer arrays
for (var i = 0; i < 10; i++) {
	module.exports.playerPos.push({
		x: null,
		y: null,
		alive: false
	})

	module.exports.playerBuffers.push([])
	module.exports.playerElements.push(document.getElementById("player" + i))
}

// On a round indicator packet
module.exports.renderer.on("round", (event, phase) => {
	// Abort if there's no change in phase
	if (module.exports.gamePhase == phase) return

	// If the round has ended
	if ((phase == "freezetime" && module.exports.gamePhase == "over") || (phase == "live" && module.exports.gamePhase == "over")) {
		// Emit a custom event
		module.exports.renderer.emit("roundend")
	}

	// Set the new phase
	module.exports.gamePhase = phase
})
