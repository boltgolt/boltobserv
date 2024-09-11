// Render initializer
//
// Starts all other renderers.

// If a welcome packet has been received
let hasConfig = false
// If the map is ready, called by _map.js
let hasMap = false
// If importScripts has been run
let hasInited = false

/**
 * Add script elements for scripts to import, can also be called from _map.js
 */
function importScripts() {
	// Only do this once, and only if we already have both the map and the config
	if (!hasConfig || !hasMap || hasInited) return
	hasInited = true

	// Go through all scripts and append them to the body
	for (let script of hasConfig) {
		let tag = document.createElement("script")
		tag.setAttribute("src", "/renderers/" + script)
		document.body.appendChild(tag)
	}
}

socket.element.addEventListener("welcome", event => {
	if (hasConfig) return
	hasConfig = event.data.scripts
	global.config = event.data.config

	importScripts()

	// Loop through each player dot to apply the scaling config option
	for (let playerElem of document.getElementsByClassName("player")) {
		playerElem.style.transform = `scale(${event.data.config.radar.playerDotScale}) translate(-50%, 50%)`
	}

	for (let labelElement of document.getElementsByClassName("label")) {
		labelElement.style.transform = `scale(${global.config.radar.playerDotScale}) translate(-50%, 50%)`
	}

	if (navigator.userAgent.toLowerCase().indexOf(" electron/") <= -1) {
		// Remove the elements meant to drag the window in electron
		document.getElementById("dragarea").style.display = "none"
		// Set cursor to default, as we don't have a drag area
		document.body.style.cursor = "default"

		if (!global.config.browser.transparent) {
			document.body.style.background = "#000"
		}
	}

	// Insert stylesheet into head to apply some CSS setings from config
	document.documentElement.style.setProperty("--config-tombstone-opacity", event.data.config.radar.tombstoneOpacity)
	document.documentElement.style.setProperty("--config-bomb-dot-scale", event.data.config.radar.bombDotScale)
})

if (socket.native && socket.native.readyNumber === 1) {
	socket.native.send("requestWelcome")
}

window.addEventListener("DOMContentLoaded", () => {
	// If not electron (browser)
	if (navigator.userAgent.toLowerCase().indexOf(" electron/") <= -1) {
		// Reload the site when a new HTML page has been rendered
		socket.element.addEventListener("pageUpdate", event => {
			location.reload()
		})
	}
})
