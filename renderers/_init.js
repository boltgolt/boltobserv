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

	// Do the same for the bomb icon
	document.getElementById("bomb").style.transform = `scale(${event.data.config.radar.playerDotScale}) translate(-50%, -50%)`
})
