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
	playerSplits: [],
	playerElements: [],

	/**
	 * Convert in-game position units to radar percentages
	 * @param  {Array}  positionObj In-game position object with X and Y, and an optional Z
	 * @param  {String} axis        The axis to calculate position for
	 * @param  {Number} playerNum   An optional player number to wipe location buffer on split switch
	 * @return {Number}             Relative radar percentage
	 */
	positionToPerc: (positionObj, axis, playerNum) => {
		// The position of the player in game, with the bottom left corner of the radar as origin (0,0)
		let gamePosition = positionObj[axis] + module.exports.mapData.offset[axis]
		// The position of the player relative to an 1024x1024 pixel grid
		let pixelPosition = gamePosition / module.exports.mapData.resolution
		// The position of the player as an percentage for any size
		let precPosition = pixelPosition / 1024 * 100

		// Set the split to the default map
		let currentSplit = -1
		// Check if there are splits on the map and if we have a Z position
		if (module.exports.mapData.splits.length > 0 && typeof positionObj.z == "number") {
			// Go through each split
			for (let i in module.exports.mapData.splits) {
				let split = module.exports.mapData.splits[i]

				// If the position is within the split
				if (positionObj.z > split.bounds.bottom && positionObj.z < split.bounds.top) {
					// Apply the split offset and save this split
					precPosition += split.offset[axis]
					currentSplit = parseInt(i)

					// Stop checking other splits as there can only be one active split
					break
				}
			}
		}

		// If we're calculating a player position
		if (typeof playerNum == "number") {
			// Wipe the location buffer if we've changed split
			// Prevents the player from flying across the radar on split switch
			if (module.exports.playerSplits[playerNum] != currentSplit) {
				module.exports.playerBuffers[playerNum] = []
			}

			// Save this split as the last split id seen
			module.exports.playerSplits[playerNum] = currentSplit
		}

		// Return the position relative to the radar image
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

	module.exports.playerSplits.push(-1)
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
