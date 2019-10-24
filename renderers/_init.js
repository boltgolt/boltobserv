// Render initializer
//
// Starts all other renderers.

let hasConfig = false
let hasMap = false
let hasInited = false

function importScripts() {
	if (!hasConfig || !hasMap || hasInited) return
	hasInited = true

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
		playerElem.style.transform = `scale(${event.data.config.radar.playerDotScale}) translate(-50%, -50%)`
	}

	for (let labelElement of document.getElementsByClassName("label")) {
		labelElement.style.transform = `scale(${global.config.radar.playerDotScale}) translate(-50%, -50%)`
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

	// Do the same for the bomb icon
	document.getElementById("bomb").style.transform = `scale(${event.data.config.radar.playerDotScale}) translate(-50%, -50%)`
})
