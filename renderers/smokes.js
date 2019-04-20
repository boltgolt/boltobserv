// Smoke rendering
//
// Shows smokes on map an calculates duration.

let global = require("./_global")

// Live the position of all smokes
global.renderer.on("smokes", (event, smokes) => {
	// Called to show the fade in animation with a delay
	function fadeIn(smokeElement) {
		setTimeout(() => {
			smokeElement.className = "smokeEntity show"
		}, 25)
	}

	// Called to remove the smoke element after the fadeout
	function remove(smokeElement) {
		setTimeout(() => {
			smokeElement.outerHTML = ""
		}, 2000)
	}

	// Go through each smoke
	for (let smoke of smokes) {
		// Get the smoke element
		let smokeElement = document.getElementById("smoke" + smoke.id)

		// If the element does not exist yet, add it
		if (!smokeElement) {
			// Create a new element
			smokeElement = document.createElement("div")
			smokeElement.id = "smoke" + smoke.id
			smokeElement.className = "smokeEntity hide"

			// Calculate the height and width based on the map resolution
			smokeElement.style.height = smokeElement.style.width = 290 / global.mapData.resolution / 1024 * 100 + "%"

			// Add it to the DOM
			document.getElementById("smokes").appendChild(smokeElement)

			// Play the fade in animation
			fadeIn(smokeElement)

			// Calculate the offset needed to display the smoke correctly as seen in game
			// Depends on the map resolution
			let percOffset  = parseFloat(smokeElement.style.height) / 2

			// Set the location of the smoke
			smokeElement.style.left = global.positionToPerc(smoke.position.x, global.mapData.offset.x) + "%"
			smokeElement.style.bottom = global.positionToPerc(smoke.position.y, global.mapData.offset.y) - percOffset + "%"
		}

		// If the smoke has been here for over 15 seconds, ready the smoke element for the fade away
		// Setting the fading class will set the opacity transition to another value
		if (smoke.time > 15 && smoke.time <= 16.4 && smokeElement.className != "smokeEntity fading") {
			smokeElement.className = "smokeEntity fading"
		}

		// Trigger the fade away
		if (smoke.time > 16.4 && smokeElement.className != "smokeEntity fading hide") {
			smokeElement.className = "smokeEntity fading hide"
			remove(smokeElement)
		}
	}
})

// Clear all smokes on round reset
global.renderer.on("roundend", (event) => {
	document.getElementById("smokes").innerHTML = ""
})
