// Projectile rendering
//
// Shows any flying nades on the map.

// Fired with an array of projectiles that are currently in the air
socket.element.addEventListener("projectiles", event => {
	let projectiles = event.data
	let activeProjectiles = []

	for (let projectile of projectiles) {
		activeProjectiles.push("projectile" + projectile.id)

		// Get the projectile element
		let projectileElement = document.getElementById("projectile" + projectile.id)

		// If the element does not exist yet, add it
		if (!projectileElement) {
			// Create a new element
			projectileElement = document.createElement("div")
			projectileElement.id = "projectile" + projectile.id
			projectileElement.className = projectile.team

			projectileElement.style.backgroundImage = "url('../img/projectile-" + projectile.type + "-" + projectile.team + ".webp')"

			// Add it to the DOM
			document.getElementById("projectiles").appendChild(projectileElement)
		}

		// Set the location of the smoke
		projectileElement.style.left = global.positionToPerc(projectile.position, "x") + "%"
		projectileElement.style.bottom = global.positionToPerc(projectile.position, "y") + "%"
	}

	for (let projectileElement of document.getElementById("projectiles").children) {
		if (!activeProjectiles.includes(projectileElement.id)) {
			projectileElement.outerHTML = ""
		}
	}
})

// Clear all projectiles on round reset
socket.element.addEventListener("roundend", event => {
	document.getElementById("projectiles").innerHTML = ""
})
