// Projectile rendering
//
// Shows any flying nades on the map.

// Fired with an array of projectiles that are currently in the air
socket.element.addEventListener("projectiles", event => {
	let projectiles = event.data
	let activeProjectiles = []

	for (let projectile of projectiles) {
		activeProjectiles.push("projectile" + projectile.id)

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

			projectileElement.style.backgroundImage = "url('../img/projectile-" + projectile.type + "-" + projectile.team + ".webp')"

			// Add it to the DOM
			document.getElementById("projectiles").appendChild(projectileElement)

			trailElement = document.createElementNS('http://www.w3.org/2000/svg',"path");
			trailElement.id = "trail" + projectile.id
			trailElement.setAttributeNS(null, "fill", "none")

			trailElement.setAttributeNS(null, "stroke-width", global.mapData.resolution * 0.3)
			trailElement.setAttributeNS(null, "stroke", projectile.team == "T" ? "#ffa70166" : "#0071b266")
			trailElement.setAttributeNS(null, "d", "M " + posX + " " + (100 - posY))

			// Add it to the DOM
			document.getElementById("trails").appendChild(trailElement)
		}

		trailElement.setAttributeNS(null, "d", trailElement.getAttributeNS(null, "d") + " L " + posX + " " + (100 - posY))

		// Set the location of the smoke
		projectileElement.style.left = posX + "%"
		projectileElement.style.bottom = posY + "%"
	}

	for (let projectileElement of document.getElementById("projectiles").children) {
		if (!activeProjectiles.includes(projectileElement.id)) {
			projectileElement.outerHTML = ""

			let trailElement = document.getElementById("trail" + projectileElement.id.substr(10))
			if (trailElement) document.getElementById("trails").removeChild(trailElement)
		}
	}
})

// Clear all projectiles on round reset
socket.element.addEventListener("roundend", event => {
	document.getElementById("projectiles").innerHTML = ""
	document.getElementById("trails").innerHTML = ""
})
