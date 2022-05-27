// Shared render object
//
// Provides shared variables and functions for all renderers.

global = {
	// Config loaded from disk
	config: {},
	// Effects triggered by key-binds
	effects: {},
	mapData: {},
	currentMap: "none",
	// The last known game phase
	gamePhase: "freezetime",

	playerPos: [],
	playerBuffers: [],
	playerSplits: [],
	playerDots: [],
	playerLabels: [],
	playerAmmos: [],
	playerHealths: [],

	projectilePos: {},
	projectileBuffer: {},

	/**
	 * Convert in-game position units to radar percentages
	 * @param  {Array}  positionObj In-game position object with X and Y, and an optional Z
	 * @param  {String} axis        The axis to calculate position for
	 * @param  {Number} playerNum   An optional player number to wipe location buffer on split switch
	 * @return {Number}             Relative radar percentage
	 */
	positionToPerc: (positionObj, axis, playerNum) => {
		// The position of the player in game, with the bottom left corner of the radar as origin (0,0)
		let gamePosition = positionObj[axis] + global.mapData.offset[axis]
		// The position of the player relative to an 1024x1024 pixel grid
		let pixelPosition = gamePosition / global.mapData.resolution
		// The position of the player as an percentage for any size
		let precPosition = pixelPosition / 1024 * 100

		// Set the split to the default map
		let currentSplit = -1
		// Check if there are splits on the map and if we have a Z position
		if (global.mapData.splits.length > 0 && typeof positionObj.z == "number") {
			// Go through each split
			for (let i in global.mapData.splits) {
				let split = global.mapData.splits[i]

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
			if (global.playerSplits[playerNum] != currentSplit) {
				global.playerBuffers[playerNum] = []
			}

			// Save this split as the last split id seen
			global.playerSplits[playerNum] = currentSplit
			global.playerPos[playerNum].split = currentSplit
		}

		// Return the position relative to the radar image
		return precPosition
	}
}

// Fill position and buffer arrays
for (var i = 0; i < 10; i++) {
	global.playerPos.push({
		x: null,
		y: null,
		alive: false
	})

	global.playerSplits.push(-1)
	global.playerBuffers.push([])
	global.playerDots.push(document.getElementById("dot" + i))
	global.playerLabels.push(document.getElementById("label" + i))
	global.playerAmmos.push({})
	global.playerHealths.push(0)
}
