// Player position calculations
//
// Sets player dot style and pushed to player location buffer, but does not set
// the location.

socket.element.addEventListener("players", event => {
	let data = event.data

	// Abort if no map has been selected yet
	if (global.currentMap == "none") return

	// Loop though each player
	for (let player of data.players) {
		// Get their player element and start building the class
		let playerDot = global.playerDots[player.num]
		let playerLabel = global.playerLabels[player.num]
		let classes = [player.team]

		// Add the classes for dead players and bomb carriers
		if (!player.alive) classes.push("dead")
		if (player.bomb) classes.push("bomb")
		if (player.active) classes.push("active")

		// Add all classes as a class string
		let newClasses = classes.join(" ")

		// Check if the new classname is different than the one already applied
		// This prevents unnecessary className updates and CSS recalculations
		if (playerDot.className != "dot " + newClasses) playerDot.className = "dot " + newClasses
		if (playerLabel.className != "label " + newClasses) playerLabel.className = "label " + newClasses

		// Save the position so the main loop can interpolate it
		global.playerPos[player.num].x = global.positionToPerc(player.position, "x", player.num)
		global.playerPos[player.num].y = global.positionToPerc(player.position, "y", player.num)
		global.playerPos[player.num].a = player.angle
		global.playerPos[player.num].z = player.position.z

		// Set the player alive attribute (used in autozoom)
		global.playerPos[player.num].alive = player.alive
	}
})

// On round reset
socket.element.addEventListener("roundend", event => {
	let phase = event.data

	// Go through each player
	for (let num in global.playerBuffers) {
		// Empty the location buffer
		global.playerBuffers[num] = []
		// Reset the player position
		global.playerPos[num] = {
			x: null,
			y: null,
			z: null,
			a: null,
			alive: false
		}
	}
})
