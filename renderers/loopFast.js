// Main loop
//
// Sets player position on screen at +/- 60fps

// Function to be executed before every frame paint
function step() {
	// Go though every player location buffer
	for (let num in global.playerBuffers) {
		// if a new player position is available
		if (global.playerPos[num].x != null) {
			// Add it to the start of the buffer
			global.playerBuffers[num].unshift({
				x: global.playerPos[num].x,
				y: global.playerPos[num].y
			})

			// Limit the size of the buffer to the count specified in the config
			global.playerBuffers[num] = global.playerBuffers[num].slice(0, global.config.radar.playerSmoothing)
		}

		// Take the average of the X and Y buffers
		let bufferPercX = (global.playerBuffers[num].reduce((prev, curr) => prev + curr.x, 0) / (global.playerBuffers[num].length))
		let bufferPercY = (global.playerBuffers[num].reduce((prev, curr) => prev + curr.y, 0) / (global.playerBuffers[num].length))

		// Apply the calculated X and Y to the player dot
		global.playerElements[num].style.left = bufferPercX + "%"
		global.playerElements[num].style.bottom = bufferPercY + "%"
	}

	// Wait for next repaint
	window.requestAnimationFrame(step)
}

// Request an update before the next repaint
// Maximizes FPS with the least CPU possible
window.requestAnimationFrame(step)
