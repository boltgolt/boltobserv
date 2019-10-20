// Smoke rendering
//
// Shows smokes on map an calculates duration.

// The live position of all smokes
socket.element.addEventListener("smokes", event => {
	let smokes = event.data

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
			smokeElement.style.left = global.positionToPerc(smoke.position, "x") + "%"
			smokeElement.style.bottom = global.positionToPerc(smoke.position, "y") - percOffset + "%"
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

//molotov on radar
socket.element.addEventListener("infernos", event => {
	let infernos = event.data

	// Go through each smoke
	for (let inferno of infernos) {
		// Get the molotov element
		let infernoElement = document.getElementById("inferno" + inferno.id)
		let flameElementsStr = ""
		let flameElement = []

		// If the element does not exist yet, add it
		if (!infernoElement) {
			// Create a new element
			infernoElement = document.createElement("div")
			infernoElement.id = "inferno" + inferno.id
			infernoElement.className = "inferno"
			infernoElement.setAttribute('style', 'opacity:1')
			document.getElementById("infernos").appendChild(infernoElement)

		}
			infernoElement = document.getElementById("inferno" + inferno.id)
			for (var i = 0; i < inferno.flamesNum; i++) {
				flameElement[i] = document.createElement("div")
				flameElement[i].style.height = flameElement[i].style.width = 100 / global.mapData.resolution / 1024 * 100 + "%"
				let percOffset  = parseFloat(flameElement[i].style.height) / 2
				flameElement[i].style.left = global.positionToPerc(inferno.flamesPosition[i], "x") + "%"
				flameElement[i].style.bottom = global.positionToPerc(inferno.flamesPosition[i], "y") - percOffset + "%"
				flameElementsStr = flameElementsStr + flameElement[i].outerHTML
			}
			infernoElement.innerHTML = flameElementsStr

	}

})

socket.element.addEventListener("infernoRemove", event => {
	if (document.getElementById("inferno" + event.data)) {
		document.getElementById("inferno" + event.data).style.opacity = 0
	}
})
// Clear all smokes on round reset
socket.element.addEventListener("roundend", event => {
	document.getElementById("smokes").innerHTML = ""
	document.getElementById("infernos").innerHTML = ""
})
