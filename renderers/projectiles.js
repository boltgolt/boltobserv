// Projectile rendering
//
// Shows any flying projectioes on the map.

// Fired with an array of projectiles that are currently in the air
socket.element.addEventListener("projectiles", event => {
	if (!global.config.radar.projectiles) return

	let projectiles = event.data
	let activeProjectiles = []

	// For each projectile in the packet
	for (let projectile of projectiles) {
		// Mark the projectile id as active
		activeProjectiles.push("projectile" + projectile.id)

		// Calculate positions relative to the radar
		let posX = global.positionToPerc(projectile.position, "x")
		let posY = global.positionToPerc(projectile.position, "y")

		// Get the projectile element
		let projectileElement = document.getElementById("projectile" + projectile.id)
		let trailElement = document.getElementById("trail" + projectile.id)

		// If the element does not exist yet, add it
		if (!projectileElement) {
			// Create a new element
			projectileElement = document.createElement("div")
			projectileElement.id = "projectile" + projectile.id
			projectileElement.className = projectile.team

			projectileElement.style.backgroundImage = "url('/img/projectile-" + projectile.type + "-" + projectile.team + ".webp')"

			// Add it to the DOM
			document.getElementById("projectiles").appendChild(projectileElement)

			// Create a trail path element
			trailElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
			trailElement.id = "trail" + projectile.id

			// Set the width relative to the scale of the radar
			trailElement.setAttributeNS(null, "stroke-width", global.mapData.resolution * 0.2)
			// Color it with the team colors
			trailElement.setAttributeNS(null, "stroke", projectile.team == "T" ? "#ffa70166" : "#1584C466")
			// Move the start of the path to the currtent position
			trailElement.setAttributeNS(null, "d", "M " + posX + " " + (100 - posY))

			// Add it to the DOM
			document.getElementById("trails").appendChild(trailElement)

			// Initialize the smooth position buffer
			global.projectileBuffer["projectile" + projectile.id] = []
		}

		// Save the current position so the fast loop can pick it up
		global.projectilePos["projectile" + projectile.id] = {
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
			let trailElement = document.getElementById("trail" + projectileElement.id.substr(10))
			if (trailElement) document.getElementById("trails").removeChild(trailElement)

			// Clear the old position and buffers
			delete global.projectilePos[projectileElement.id]
			delete global.projectileBuffer[projectileElement.id]
		}
	}
})

// Clear all projectiles on round reset
socket.element.addEventListener("roundend", event => {
	document.getElementById("projectiles").innerHTML = ""
	document.getElementById("trails").innerHTML = ""
})
