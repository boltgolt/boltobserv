// Main loop
//
// Sets player position on screen at +/- 60fps

// Function to be executed before every frame paint
function step() {
	// Go though every player location buffer
	for (let num in global.playerBuffers) {
		// If a new player position is available
		if (global.playerPos[num].x != null) {
			// We want to check if the angle value has looped around, so we need a previous value
			if (global.playerBuffers[num][0]) {
				// If the angle used to be small, but is large now
				if (global.playerPos[num].a > 270 && global.playerBuffers[num][0].a < 90) {
					// Move the old value to the other side of the 360 degree circle
					global.playerBuffers[num].forEach(buffer => {buffer.a += 360})
				}

				// If the angle used to be large, but is low now
				if (global.playerPos[num].a < 90 && global.playerBuffers[num][0].a > 270) {
					// Move the old value to the other side of the 360 degree circle
					global.playerBuffers[num].forEach(buffer => {buffer.a -= 360})
				}
			}

			// Add it to the start of the buffer
			global.playerBuffers[num].unshift({
				x: global.playerPos[num].x,
				y: global.playerPos[num].y,
				a: global.playerPos[num].a
			})

			// Limit the size of the buffer to the count specified in the config
			global.playerBuffers[num] = global.playerBuffers[num].slice(0, global.config.radar.playerSmoothing)

			// Experimental color coding
			if (global.mapData.zRange) {
				let zRange = global.mapData.zRange

				if (typeof global.playerPos[num].split == "number") {
					if (global.playerPos[num].split >= 0) {
						zRange = global.mapData.splits[global.playerPos[num].split].zRange
					}
				}

				let color = global.config.radar.verticalIndicator[0]
				let perc = Math.abs(global.playerPos[num].z - zRange.min) / Math.abs(zRange.max - zRange.min)
				perc = Math.min(1, Math.max(0, perc))

				if (perc > 0.5) {
					color = global.config.radar.verticalIndicator[2]
					perc = (perc - 0.5)
				}
				else {
					perc = 0.5 - perc
				}
				document.getElementById("height" + num).style.background = `rgb(${global.config.radar.verticalIndicator[1]})`
				document.getElementById("height" + num).style.boxShadow = `inset 0 0 0 1.5vmin rgba(${color},${perc*2})`
				console.log(zRange)
			}

		}

		// Take the average of the X, Y and rotation buffers
		let bufferPercX = (global.playerBuffers[num].reduce((prev, curr) => prev + curr.x, 0) / (global.playerBuffers[num].length))
		let bufferPercY = (global.playerBuffers[num].reduce((prev, curr) => prev + curr.y, 0) / (global.playerBuffers[num].length))
		let bufferAngle = (global.playerBuffers[num].reduce((prev, curr) => prev + curr.a, 0) / (global.playerBuffers[num].length))

		// Apply the calculated X and Y to the player dot
		global.playerDots[num].style.left = bufferPercX + "%"
		global.playerDots[num].style.bottom = bufferPercY + "%"
		global.playerLabels[num].style.left = bufferPercX + "%"
		global.playerLabels[num].style.bottom = bufferPercY + "%"

		if (global.playerPos[num].alive) {
			global.playerDots[num].style.transform = `rotate(${bufferAngle - 45}deg) scale(${global.config.radar.playerDotScale}) translate(-50%, 50%)`
		}
		else {
			global.playerDots[num].style.transform = `rotate(0deg) scale(${global.config.radar.playerDotScale}) translate(-50%, 50%)`
		}
	}

	// Wait for next repaint
	window.requestAnimationFrame(step)
}

// Request an update before the next repaint
// Maximizes FPS with the least CPU possible
window.requestAnimationFrame(step)
