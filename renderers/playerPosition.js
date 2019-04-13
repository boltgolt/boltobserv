// Player position calculations
//
// Sets player dot style and pushed to player location buffer, but does not set
// the location.

let global = require("./_global")

global.renderer.on("players", (event, data) => {
	// Abort if no map has been selected yet
	if (global.currentMap == "none") return

	// Loop though each player
	for (let player of data.players) {
		// Get their player element and start building the class
		let playerElement  = global.playerElements[player.num]
		let classes = ["player", player.team]

		// Add the classes for dead players and bomb cariers
		if (!player.alive) classes.push("dead")
		if (player.bomb) classes.push("bomb")

		// Add all classes as a class string
		let newClasses = classes.join(" ")

		// Check if the new classname is different than the one already applied
		// This prevents unnecessary className updates and CSS recalculations
		if (playerElement.className != newClasses) {
			playerElement.className = newClasses
		}

		// Save the position so the main loop can interpolate it
		global.playerPos[player.num].x = global.positionToPerc(player.position.x, global.mapData.offset.x)
		global.playerPos[player.num].y = global.positionToPerc(player.position.y, global.mapData.offset.y)

		// Set the player alive atribute (used in autozoom)
		global.playerPos[player.num].alive = player.alive
	}
})

// On round reset
global.renderer.on("roundend", (event, phase) => {
	// Go through each player
	for (let num in global.playerBuffers) {
		// Empty the location buffer
		global.playerBuffers[num] = []
		// Reset the player position
		global.playerPos[num] = {
			x: null,
			y: null,
			alive: false
		}
	}
})
