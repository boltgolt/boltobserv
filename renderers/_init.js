// Render initializer
//
// Starts all other renderers.

let global = require("./_global")
const fs = require("fs")
const path = require("path")

// Get a list of available renderers
let renderers = fs.readdirSync(__dirname)

for (let renderer of renderers) {
	// Skip renderers that start with a "_", as they are only helpers
	if (renderer.slice(0, 1) == "_") continue
	// Load in the render module
	require(path.join(__dirname, renderer))
}

// Loop through each player dot to apply the scaling config option
for (let playerElem of document.getElementsByClassName("player")) {
	playerElem.style.transform = `scale(${global.config.radar.playerDotScale}) translate(-50%, -50%)`
}

// Do the same for the bomb icon
document.getElementById("bomb").style.transform = `scale(${global.config.radar.playerDotScale}) translate(-50%, -50%)`
