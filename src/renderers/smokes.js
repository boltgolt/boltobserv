// Smoke rendering
//
// Shows smokes/infernos/flashbangs on map and calculates duration.

// The live position of all smokes
socket.element.addEventListener("smokes", event => {
	let smokes = event.data

	// Called to show the fade in animation with a delay
	function fadeIn(smokeElement, team) {
		setTimeout(() => {
			smokeElement.className = "smokeEntity show " + team
		}, 25)
	}

	// Called to remove the smoke element after the fadeout
	function remove(smokeElement) {
		setTimeout(() => {
			smokeElement.remove()
		}, 2000)
	}

	// Go through each smoke
	for (let smoke of smokes) {
		// Create unique id, because the GSI id can have duplicate IDs now
		let smokeID = "smoke" + smoke.id + (smoke.position.x + smoke.position.y + smoke.position.z)
		// Get the smoke element
		let smokeElement = document.getElementById(smokeID)

		// Color the smokes if that option is enabled
		let team = "U"
		if (global.config.radar.smokeColors) team = smoke.team

		// If the element does not exist yet, add it
		if (!smokeElement) {
			// Do not add a new smoke element if it has already started fading out
			if (smoke.time > 20.1) continue

			// Create a new element
			smokeElement = document.createElement("div")
			smokeElement.id = smokeID
			smokeElement.className = "smokeEntity hide " + team

			// Calculate the height and width based on the map resolution
			smokeElement.style.height = smokeElement.style.width = 300 / global.mapData.resolution / 1024 * 100 + "%"

			// Add it to the DOM
			document.getElementById("smokes").appendChild(smokeElement)

			// Play the fade in animation
			fadeIn(smokeElement, team)

			// Safety timeout: never show for longer than 23 sec
			setTimeout(() =>  {
				remove(smokeElement)
			}, 23000)
		}

		// Set the location of the smoke
		smokeElement.style.left = global.positionToPerc(smoke.position, "x") + "%"
		smokeElement.style.bottom = global.positionToPerc(smoke.position, "y") + "%"

		// If the smoke has been here for over 15 seconds, ready the smoke element for the fade away
		// Setting the fading class will set the opacity transition to another value
		if (smoke.time > 15 && smoke.time <= 16.4 && smokeElement.className != "smokeEntity fading " + team) {
			smokeElement.className = "smokeEntity fading " + team
		}

		// Trigger the fade away
		if (smoke.time > 20.1 && smokeElement.className != "smokeEntity fading hide " + team) {
			smokeElement.className = "smokeEntity fading hide " + team
			remove(smokeElement)
		}
	}
})

// When a grenade explodes, show gap in smoke
socket.element.addEventListener("explosion", event => {
	let pos = event.data.position


	for (let smokeElement of document.getElementById("smokes").childNodes) {
		// Don't add more than one for the same explosion
		if (smokeElement.querySelector("#gap" + event.data.id)) continue

		// Get smoke position from html attr
		let smokeX = parseFloat(smokeElement.style.left.slice(0, -1))
		let smokeY = parseFloat(smokeElement.style.bottom.slice(0, -1))
		let smokeSize = parseFloat(smokeElement.style.width.slice(0, -1))

		// Calculate the relative distance between the center point of the smoke and the grenade
		let dist = (Math.abs(smokeX - pos.x) + Math.abs(smokeY - pos.y)) * global.mapData.resolution

		if (dist < global.mapData.resolution * 4) {
			// Create a new element
			let gapElement = document.createElement("div")
			gapElement.className = "flash"
			gapElement.id = "gap" + event.data.id

			// Calculate gap position within smoke
			gapElement.style.left = (pos.x - smokeX) / smokeSize * 100 + "%"
			gapElement.style.bottom = (pos.y - smokeY) / smokeSize * 100 + "%"

			// Insert gap into smoke
			smokeElement.appendChild(gapElement)

			// Fade out the flash animation
			setTimeout(() => {
				gapElement.className = ""
			}, 100)

			// Remove the gap
			setTimeout(() => {
				gapElement.className = "fade"
			}, 550)
		}
	}
})

// The position of all infernos
socket.element.addEventListener("infernos", event => {
	let infernos = event.data
	// List of all infernos that are currently still in the game
	let activeInfernos = []

	// Go through each inferno
	for (let inferno of infernos) {
		// Get the inferno element
		let infernoElement = document.getElementById("inferno" + inferno.id)
		let flameElementsStr = ""
		let flameElement = []

		// Mark inferno as currently active in the game
		activeInfernos.push("inferno" + inferno.id)

		// If the element does not exist yet, add it
		if (!infernoElement) {
			infernoElement = document.createElement("div")

			infernoElement.id = "inferno" + inferno.id
			infernoElement.className = "inferno"
			infernoElement.style.opacity = 1

			// Add it to the inferno container
			document.getElementById("infernos").appendChild(infernoElement)
		}

		// For each flame in the inferno
		for (var i = 0; i < inferno.flamesNum; i++) {
			// Create a new flame
			flameElement[i] = document.createElement("div")

			// Style the flame
			flameElement[i].style.height = flameElement[i].style.width = 100 / global.mapData.resolution / 1024 * 100 + "%"
			flameElement[i].style.left = global.positionToPerc(inferno.flamesPosition[i], "x") + "%"
			flameElement[i].style.bottom = global.positionToPerc(inferno.flamesPosition[i], "y")  + "%"

			// Add it to the parent inferno
			flameElementsStr += flameElement[i].outerHTML
		}

		// SHow the new inferno elements
		infernoElement.innerHTML = flameElementsStr
	}

	// Go through inferno elements on the radar
	for (let infernoElem of document.getElementsByClassName('inferno')) {
		// If the inferno is on the radar but no longer in the game, fade it out
		if (!activeInfernos.includes(infernoElem.id)) {
			infernoElem.style.opacity = 0

			setTimeout(() => {
				infernoElem.remove()
			}, 400)
		}
	}
})

// The live position of all flashbangs
socket.element.addEventListener("flashbangs", event => {
	let flashbangs = event.data

	// Go through each flashbang
	for (let flashbang of flashbangs) {
		// Get the flashbang element
		let flashbangElement = document.getElementById("flashbang" + flashbang.id)

		// If the element does not exist yet, add it
		if (!flashbangElement) {
			// Create a new element
			flashbangElement = document.createElement("div")
			flashbangElement.id = "flashbang" + flashbang.id
			flashbangElement.className = "flashbangEntity"

			// Calculate the height and width based on the map resolution
			flashbangElement.style.height = flashbangElement.style.width = 290 / global.mapData.resolution / 1024 * 100 + "%"

			// Add it to the DOM
			document.getElementById("flashbangs").appendChild(flashbangElement)

			// Set the location of the flashbang
			flashbangElement.style.left = global.positionToPerc(flashbang.position, "x") + "%"
			flashbangElement.style.bottom = global.positionToPerc(flashbang.position, "y") + "%"

			// Play a "pop" animation after adding
			setTimeout(() => {
				flashbangElement.className = "flashbangEntity full"
			}, 100)

			// Fade out slowly
			setTimeout(() => {
				flashbangElement.className = "flashbangEntity full hide"
			}, 1200)

			// Remove element when invisible
			setTimeout(() => {
				flashbangElement.remove()
			}, 2200)
		}
	}
})

// Clear all smokes and infernos on round reset
socket.element.addEventListener("roundend", event => {
	document.getElementById("smokes").innerHTML = ""
	document.getElementById("trails").innerHTML = ""
	document.getElementById("infernos").innerHTML = ""
	document.getElementById("flashbangs").innerHTML = ""
})
