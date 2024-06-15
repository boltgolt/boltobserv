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

		// Mark dead players with a cross
		if (player.health <= 0) {
			classes.push("dead")
		}
		else {
			// Make the bomb carrier orange and and a line around the spectated player
			if (player.bomb) classes.push("bomb")
			if (player.active) classes.push("active")
      if (player.flashed > 31) classes.push("flashed")

			// If drawing muzzle flashes is enabled
			if (global.config.radar.shooting) {
				// Go through each weapon the player has
				for (let weapon in player.ammo) {
					if (global.playerAmmos[player.num][weapon]) {
						// They are shooting if there's less ammo in the clip than the packet before
						if (global.playerAmmos[player.num][weapon] > player.ammo[weapon]) {
								classes.push("shooting")
						}
					}
				}

				// Save the last ammo stats for the next packet
				global.playerAmmos[player.num] = player.ammo
			}

			// If damage indicators are enabled
			if (global.config.radar.damage) {
				// If we have less health than last packet we are hurtin'
				if (player.health < global.playerHealths[player.num]) {
					classes.push("hurting")
				}

				// Save the health value for next time
				global.playerHealths[player.num] = player.health
			}

			// Save the position so the main loop can interpolate it
			global.playerPos[player.num].x = global.positionToPerc(player.position, "x", player.num)
			global.playerPos[player.num].y = global.positionToPerc(player.position, "y", player.num)
			global.playerPos[player.num].a = player.angle
			global.playerPos[player.num].z = player.position.z
		}

		// Add all classes as a class string
		let newClasses = classes.join(" ")

		// Check if the new classname is different than the one already applied
		// This prevents unnecessary className updates and CSS recalculations
		if (playerDot.className != "dot " + newClasses) playerDot.className = "dot " + newClasses
		if (playerLabel.className != "label " + newClasses) playerLabel.className = "label " + newClasses

		// Set the player alive attribute (used in autozoom)
		global.playerPos[player.num].alive = player.health > 0

		if (global.config.radar.showName == "both") {
			playerLabel.children[0].textContent = player.name.substring(0, global.config.radar.maxNameLength)
		}
		if (global.config.radar.showName == "always") {
			playerLabel.textContent = player.name.substring(0, global.config.radar.maxNameLength)
		}
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

		// Force a re-render on the dot and label, can sometimes bug out in electron
		global.playerDots[num].style.display = "none"
		global.playerDots[num].style.display = "block"
		global.playerLabels[num].style.display = "none"
		global.playerLabels[num].style.display = ""
	}
})
