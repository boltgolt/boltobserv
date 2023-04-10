// Main loop
//
// Sets player position on screen at +/- 60fps

// Function to be executed before every frame paint
function step() {
	// Go though every player location buffer
	for (let num in global.playerBuffers) {
		// Scale that can be changed by the vertical indicator
		let scale = global.config.radar.playerDotScale

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

			// If the map and config support vertical indicator
			if (global.mapData.zRange && global.config.vertIndicator && global.config.vertIndicator.type != "none") {
				// Get the z range from the config
				let zRange = global.mapData.zRange

				// If the player is in a split, get that z range
				if (typeof global.playerPos[num].split == "number") {
					if (global.playerPos[num].split >= 0) {
						zRange = global.mapData.splits[global.playerPos[num].split].zRange
					}
				}

				// Calculate player z-height in the given range on a scale of 0 to 1
				let perc = Math.abs(global.playerPos[num].z - zRange.min) / Math.abs(zRange.max - zRange.min)
				if (global.playerPos[num].z < zRange.min) perc = 0
				perc = Math.min(1, Math.max(0, perc))

				// If the color indicator is enabled
				if (global.config.vertIndicator.type == "color") {
					// Get all colors and make them RGB values
					let bottomColor = global.config.vertIndicator.colorRange[0].join(",")
					let mediumColor = global.config.vertIndicator.colorRange[1].join(",")
					let topColor = global.config.vertIndicator.colorRange[2].join(",")

					// By default we show the bottom color
					let color = bottomColor

					// If we're over half of the range we show the top color
					if (perc > 0.5) {
						color = topColor
						perc = (perc - 0.5)
					}
					else {
						perc = 0.5 - perc
					}

					// Show the chosen color as a background color
					document.getElementById("height" + num).style.background = `rgb(${mediumColor})`
					// Overlay the middle color with a transparency to blend the colors
					document.getElementById("height" + num).style.boxShadow = `inset 0 0 0 1.5vmin rgba(${color},${perc * 2})`
				}

				// If the scale indicator is enabled
				else if (global.config.vertIndicator.type == "scale") {
					// Scale the dot by height multiplied by the configured delta
					scale *= ((perc - 0.5) / 2 + 1) * global.config.vertIndicator.scaleDelta
					global.playerLabels[num].style.transform = `scale(${scale}) translate(-50%, 50%)`
				}

				if (global.config.radar.highestPlayerOnTop) {
					global.playerDots[num].style.zIndex = Math.round(global.playerPos[num].z + 2500)
					global.playerLabels[num].style.zIndex = Math.round(global.playerPos[num].z + 2500)
				}
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

		// Apply the transformations to the dots
		if (global.playerPos[num].alive) {
			global.playerDots[num].style.transform = `rotate(${bufferAngle - 45}deg) scale(${scale}) translate(-50%, 50%)`
		}
		else {
			global.playerDots[num].style.transform = `rotate(0deg) scale(${global.config.radar.playerDotScale}) translate(-50%, 50%)`
		}
	}

	// Go through each active projectile
	for (let id in global.projectilePos) {
		// Add the newest location to the start of the buffer
		global.projectileBuffer[id].unshift(global.projectilePos[id])

		// Limit the size of the buffer to the count specified in the config
		global.projectileBuffer[id] = global.projectileBuffer[id].slice(0, global.config.radar.projectileSmoothing)

		// Calculate the avarage position over the active buffer
		let bufferPercX = (global.projectileBuffer[id].reduce((prev, curr) => prev + curr.x, 0) / (global.projectileBuffer[id].length))
		let bufferPercY = (global.projectileBuffer[id].reduce((prev, curr) => prev + curr.y, 0) / (global.projectileBuffer[id].length))

		// Set the location of the projectile
		global.projectilePos[id].elem.style.left = bufferPercX + "%"
		global.projectilePos[id].elem.style.bottom = bufferPercY + "%"
	}

	// Wait for next repaint
	window.requestAnimationFrame(step)
}

// Request an update before the next repaint
// Maximizes FPS with the least CPU possible
window.requestAnimationFrame(step)
