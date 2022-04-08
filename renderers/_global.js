// Shared render object
//
// Provides shared variables and functions for all renderers.

global = {
	// Config loaded from disk
	config: {
		// Settings related to remote browser access to the radar
		"browser": {
			// Prevents a background from being set in the browser, for OBS capture
			"transparent": false,

			"ports": {
				// Serves static files, such as HTML. Use this one in your browser
				"static": 36364,
				// Dynamic websocket port, used for live data transport
				"socket": 36365
			}
		},

		// Settings that will change the way the radar will be displayed
		"radar": {
			// Hide advisories on the radar
			"hideAdvisories": true,
			// Show the buyzones on the map, or only when players can buy
			// Can either be "never", "buytime" or "always"
			"showBuyzones": "buytime",
			// Show Boltobserv and Simple Radar logos
			"showLogos": false,

			// Show muzzle flashes for players shooting
			"shooting": true,
			// Show red indicators on player dots when their health gets lower
			"damage": true,
			// Show flashed players in a lighter color
			"flashes": true,

			// Frames to smooth out player movement
			"playerSmoothing": 13,

			// Amount of scaling to apply to player dots on the radar
			// Values above 1 might be blurry
			"playerDotScale": 0.7,
			// Same as the above, but for the bomb
			"bombDotScale": 0.7
		},

		// Show a vertical indicator on every player dot, indicating how high the player is on the map
		"vertIndicator": {
			// Indicator type, can either be "none", "color" or "scale"
			"type": "none",

			// RGB values for the color indicator, from lowest to highest
			"colorRange": [[13, 255, 0], [255, 255, 255], [255, 0, 199]],
			// Controls by how much dots should scale depending on height, works in combination with playerDotScale
			// 0.5 halves the amount of scaling, 1 keeps it the default, 1.5 makes player dots scale more
			"scaleDelta": 1
		},

		// Settings for automatically zooming in on alive players on the map
		"autozoom": {
			// Enable or disable autozoom
			"enable": false,

			// Frames to smooth out zoom movement
			"smoothing": 32,

			// Percentage of radar space to try to keep as padding between the outermost players and the edge of the radar
			"padding": 0.3,

			// Only apply autozoom if calculated zoom level would be at least this much
			// In decimals, where 1.2 would mean 20% more zoomed in than the default radar
			"minZoom": 1.3
		},

		// Settings related to the CSGO game
		"game": {
			// Seconds of inactivity before considering a connection to the game client as lost
			// Set to -1 to never timeout
			"connectionTimout": 30,

			// The port GSI will try to connect to
			"networkPort": 36363,

			// Tries to detect the CSGO game on the machine and prompts to install the CFG file if it hasn't already
			"installCfg": true
		},

		// Settings that should not be used in normal operation, but help to find issues
		"debug": {
			// Print the loaded config into the console
			"printConfig": false,

			// Don't open any electron window, just start the server
			// Do NOT execute Boltobserv outside a terminal with this enabled, could become a zombie process
			"terminalOnly": false
		}
	},
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
