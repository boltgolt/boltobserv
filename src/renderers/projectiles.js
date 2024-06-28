// Projectile rendering
//
// Shows any flying projectioes on the map.

// Fired with an array of projectiles that are currently in the air
socket.element.addEventListener("projectiles", event => {
	if (!global.config.radar.projectiles) return

	let projectiles = event.data
	let activeProjectiles = []
	let type = global.config.radar.plainProjectiles ? 'hc' : 'img'

	// For each projectile in the packet
	for (let projectile of projectiles) {
		// Create unique id, because the GSI id can have duplicate IDs now
		let projectileID = "projectile" + projectile.id

		// Calculate positions relative to the radar
		let posX = global.positionToPerc(projectile.position, "x")
		let posY = global.positionToPerc(projectile.position, "y")

		// Get the projectile element
		let projectileElement = document.getElementById(projectileID)
		let trailElement = document.getElementById("trail" + projectileID)

		// If the element does not exist yet, add it
		if (!projectileElement) {
			// Create a new element
			projectileElement = document.createElement("div")
			projectileElement.id = projectileID
			projectileElement.className = projectile.team

			projectileElement.style.backgroundImage = `url('/img/projectile-${type}-${projectile.type}-${projectile.team}.webp')`
			if (projectile.type == 'frag') projectileElement.dataset.isfrag = 'true'

			// Add it to the DOM
			document.getElementById("projectiles").appendChild(projectileElement)

			// Create a trail path element
			trailElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
			trailElement.id = "trail" + projectileID

			// Set the width relative to the scale of the radar
			trailElement.setAttributeNS(null, "stroke-width", global.mapData.resolution * 0.2)
			// Color it with the team colors
			trailElement.setAttributeNS(null, "stroke", projectile.team == "T" ? "#ffa70166" : "#1584C466")
			// Move the start of the path to the current position
			trailElement.setAttributeNS(null, "d", "M " + posX + " " + (100 - posY))

			// Add it to the DOM
			document.getElementById("trails").appendChild(trailElement)

			// Initialize the smooth position buffer
			global.projectileBuffer[projectileID] = []
		}

		// CS2 bug: frag grenades stay active after exploding about half the time
		if (projectile.type == 'frag') {
			// Get the previous coords from the
			let trailParts = trailElement.getAttributeNS(null, "d").split(" ")
			// True if more than three packets are known and nade stationary
			let isStationary = trailParts.length > 9

			// Go through each nade position from last to newest, max last 5
			for (let i = trailParts.length - 1; i > 2 && trailParts.length - i < 5 * 3; i -= 3) {
				// If the nade moved in this frame, it is not stationary
				if (trailParts[i] != trailParts[i - 3] || trailParts[i - 1] != trailParts[i - 4]) {
					isStationary = false
					break
				}
			}

			// Hide nade an tail if nade is stationary
			if (isStationary) {
				triggerSmokeGap(projectileElement)
				projectileElement.style.opacity = 0
				trailElement.style.opacity = 0
			}
		}

		// Mark the projectile id as active
		activeProjectiles.push(projectileID)

		// Save the current position so the fast loop can pick it up
		global.projectilePos[projectileID] = {
			x: posX,
			y: posY,
			elem: projectileElement
		}

		// Extend path to current position
		trailElement.setAttributeNS(null, "d", trailElement.getAttributeNS(null, "d") + " L " + posX + " " + (100 - posY))
	}

	// For each projectile element on the map
	for (let projectileElement of document.getElementById("projectiles").children) {
		// If the element exists but the projectile is no longer in the game
		if (!activeProjectiles.includes(projectileElement.id)) {
			// Remove the element
			projectileElement.remove()

			// Remove the trail if it exits
			let trailElement = document.getElementById("trail" + projectileElement.id)
			if (trailElement) document.getElementById("trails").removeChild(trailElement)

			// If a frag is no longer on the map it has exploded
			if (projectileElement.dataset.isfrag == 'true') {
				triggerSmokeGap(projectileElement)
			}

			// Clear the old position and buffers
			delete global.projectilePos[projectileElement.id]
			delete global.projectileBuffer[projectileElement.id]
		}
	}
})

// Create event to show gap in smoke after frag nade
function triggerSmokeGap(projectileElement) {
	let exploEvent = new Event("explosion")
	exploEvent.data = {
		id: projectileElement.id,
		position: {
			x: parseFloat(projectileElement.style.left.slice(0, -1)),
			y: parseFloat(projectileElement.style.bottom.slice(0, -1))
		}
	}

	socket.element.dispatchEvent(exploEvent)
}

// Clear all projectiles on round reset
socket.element.addEventListener("roundend", event => {
	document.getElementById("projectiles").innerHTML = ""
	document.getElementById("trails").innerHTML = ""
})
