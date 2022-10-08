// Secondary loop
//
// Handles radar autozoom every 25ms (40fps)

// Get the styling for the entire container
let radarStyle = document.getElementById("container").style
// Prepare position queues
let radarQueues = {
	scale: [1, 1, 1, 1, 1, 1],
	x: [0, 0, 0, 0, 0, 0],
	y: [0, 0, 0, 0, 0, 0]
}

// Run the loop every 25ms
setInterval(() => {
	// Abort if autozoom isn't enabled
	if (!global.config.autozoom.enable && typeof global.effects["radar.autozoom"] == "undefined") return


	// Bounding rect around all living players
	// Starts as impossibly small or large bounds so players will always overwrite it
	let bounds = {
		x: {
			min: 100,
			max: 0
		},
		y: {
			min: 100,
			max: 0
		}
	}

	// Go through each player
	for (let player of global.playerPos) {
		// Ignore dead player markers for autozoom
		if (!player.alive) continue

		// Overwrite the previous min/max if the value for this player is smaller/larger
		if (bounds.x.min > player.x) bounds.x.min = player.x
		if (bounds.x.max < player.x) bounds.x.max = player.x
		if (bounds.y.min > player.y) bounds.y.min = player.y
		if (bounds.y.max < player.y) bounds.y.max = player.y
	}

	// Calculate the zoom-level where all players alive are visible
	let radarScale = 1 + (1 - Math.max(bounds.x.max - bounds.x.min, bounds.y.max - bounds.y.min) / 100)

	// Do not zoom if the scale seems to have been calculated with just the default data
	if (radarScale === 3) return

	// Limit the radar scale to base size, and keep a customizable padding around the players
	radarScale = Math.max(1, radarScale - global.config.autozoom.padding)

	// Calculate the center of the bound
	let radarX = (((bounds.x.max + bounds.x.min) / 2) - 50) * -1
	let radarY = ((bounds.y.max + bounds.y.min) / 2) - 50

	// Reset all calculated values to default if min zoom level has not been reached
	if (radarScale < global.config.autozoom.minZoom || global.effects["radar.autozoom"] === false) {
		radarScale = 1
		radarX = radarY = 0
	}

	// Add all calculated values to their queues, and limit the queue length
	radarQueues.scale.unshift(radarScale)
	radarQueues.scale = radarQueues.scale.slice(0, global.config.autozoom.smoothing)
	radarQueues.x.unshift(radarX)
	radarQueues.x = radarQueues.x.slice(0, global.config.autozoom.smoothing)
	radarQueues.y.unshift(radarY)
	radarQueues.y = radarQueues.y.slice(0, global.config.autozoom.smoothing)

	// Calculate the average for all 3 values
	let avgScale = radarQueues.scale.reduce((sum, el) => sum + el, 0) / radarQueues.scale.length
	let avgX = radarQueues.x.reduce((sum, el) => sum + el, 0) / radarQueues.x.length
	let avgY = radarQueues.y.reduce((sum, el) => sum + el, 0) / radarQueues.y.length

	// Apply the style to the container
	radarStyle.transform = `scale(${avgScale}) translate(${avgX}%, ${avgY}%)`
}, 25)
