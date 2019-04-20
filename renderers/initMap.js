// Initial map rendering
//
// Responsible for changing radar background on map change, loading map
// metadata and applying some general config values.

let global = require("./_global")
const path = require("path")
const fs = require("fs")
const JSON5 = require("json5")

// Catch map data send by the game
global.renderer.on("map", (event, map) => {
	// If map is unchanged we do not need to do anything
	if (global.currentMap == map) return

	// Build the path to the metadata file
	let metaPath = path.join(__dirname, "..", "maps", map, "meta.json5")
	let radarPath = path.join(__dirname, "..", "maps", map, "radar.png")

	// If the meta file or radar backdrop does not exist, we don't support the map and need to quit
	if (!fs.existsSync(metaPath) || !fs.existsSync(radarPath)) {
		document.getElementById("unknownMap").style.display = "flex"
		document.getElementById("unknownMap").children[0].innerHTML = "Unsupported map " + map
		return
	}

	// Make sure that the "unknown map" message is turned off for valid maps
	document.getElementById("unknownMap").style.display = "none"

	// Show the radar backdrop
	document.getElementById("radar").src = `../maps/${map}/radar.png`

	// Set the map as the current map and in the window title
	global.currentMap = map
	document.title = "Boltobserv - " + map

	// Save the map metadata as a global attribute so other renderers can use it
	global.mapData = JSON5.parse(fs.readFileSync(metaPath, "utf8"))

	// Hide advisories if you've been disabled in the config
	if (global.config.radar.hideAdvisories) {
		document.getElementById("advisory").style.display = "none"
	}
	else {
		// Otherwise, read the advisory position from config and apply it
		document.getElementById("advisory").style.left = global.mapData.advisoryPosition.x + "%"
		document.getElementById("advisory").style.bottom = global.mapData.advisoryPosition.y + "%"
		document.getElementById("advisory").style.display = "block"
	}

	/**
	 * Draw a red rectangle over a bombsite
	 * @param  {DOMObject} element The element to move over a bombsite
	 * @param  {Object}    cords   The x1 and y1 values for the bottom left point, and x2 and y2 values for the top right point
	 */
	function drawSite(element, cords) {
		// Be sure the sites are visible
		element.style.display = "block"

		// Set the bottom left corner as defined in the cords
		element.style.left = global.positionToPerc({x: cords.x1}, "x") + "%"
		element.style.bottom = global.positionToPerc({y: cords.y1}, "y") + "%"

		// Transform the x2 and y2 cords to height and width, as HTML requires
		// Calculates the difference between the first and second points and translates that to a relative percentage
		element.style.width = ((cords.x2 - cords.x1) / global.mapData.resolution / 1024 * 100) + "%"
		element.style.height = ((cords.y2 - cords.y1) / global.mapData.resolution / 1024 * 100) + "%"
	}

	// Draw the bombsites on the map if enabled
	if (global.config.debug.drawBombsites) {
		drawSite(document.getElementById("siteA"), global.mapData.bombsites.a)
		drawSite(document.getElementById("siteB"), global.mapData.bombsites.b)
	}
})
