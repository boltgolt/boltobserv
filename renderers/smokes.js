// Smoke rendering
//
// Shows smokes on map an calculates duration.

let global = require("./_global")

global.renderer.on("smokes", (event, smokes) => {
	function fadeIn(smokeElement) {
		setTimeout(() => {
			smokeElement.className = "smokeEntity show"
		}, 25)
	}

	function remove(smokeElement) {
		setTimeout(() => {
			smokeElement.outerHTML = ""
		}, 2000)
	}

	let drawnSmokes = []

	for (let smoke of smokes) {
		let smokeElement = document.getElementById("smoke" + smoke.id)

		if (!smokeElement) {
			smokeElement = document.createElement("div")
			smokeElement.id = "smoke" + smoke.id
			smokeElement.className = "smokeEntity hide"

			smokeElement.style.height = smokeElement.style.width = 290 / global.mapData.resolution / 1024 * 100 + "%"

			document.getElementById("smokes").appendChild(smokeElement)

			fadeIn(smokeElement)
		}

		drawnSmokes.push()

		let percOffset  = parseFloat(smokeElement.style.height) / 2

		smokeElement.style.left = global.positionToPerc(smoke.position.x, global.mapData.offset.x) + "%"
		smokeElement.style.bottom = global.positionToPerc(smoke.position.y, global.mapData.offset.y) - percOffset + "%"

		if (smoke.time > 15 && smoke.time <= 16.4 && smokeElement.className != "smokeEntity fading") {
			smokeElement.className = "smokeEntity fading"
		}

		if (smoke.time > 16.4 && smokeElement.className != "smokeEntity fading hide") {
			smokeElement.className = "smokeEntity fading hide"
			remove(smokeElement)
		}
	}
})

global.renderer.on("roundend", (event) => {
	document.getElementById("smokes").innerHTML = ""
})
