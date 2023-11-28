// Advisories
//
// Determines if an advisory can be shown and prioritizes the most important one.

let idToNum = {}
let advisories = {
	planting: -1,
	defuse: -1,
	solesurvivor: -1
}

function trim(str) {
	let string = str + ""
	return string.substring(0, string.length - 2)
}

function updateAdvisory() {
	for (let name in advisories) {
		if (advisories[name] != -1) {
			document.getElementById("advisory").className = name
			document.getElementById("advisory").children[0].innerHTML = idToNum[advisories[name]] + 1
			if (document.getElementById("advisory").children[0].innerHTML == 10) {
				document.getElementById("advisory").children[0].innerHTML = 0
			}
			return
		}
	}

	document.getElementById("advisory").className = ""
}

socket.element.addEventListener("players", event => {
	let data = event.data
	let ctsAlive = []
	let tsAlive = []

	for (let player of data.players) {
		if (player.health > 0) {
			if (player.team == "CT") {
				ctsAlive.push(player.id)
			}
			else {
				tsAlive.push(player.id)
			}
		}

		if (idToNum[trim(player.id)] != player.num) {
			idToNum[trim(player.id)] = player.num
		}
	}

	if (ctsAlive.length == 1) {
		advisories.solesurvivor = trim(ctsAlive[0])
	}
	else if (tsAlive.length == 1) {
		advisories.solesurvivor = trim(tsAlive[0])
	}
	else {
		advisories.solesurvivor = -1
	}

	updateAdvisory()
})

socket.element.addEventListener("bomb", event => {
	let data = event.data

	if (idToNum[trim(data.player)]) {
		if (data.state == "planting") {
			advisories.planting = trim(data.player)
		}
		else {
			advisories.planting = -1
		}

		if (data.state == "defusing") {
			advisories.defuse = trim(data.player)
		}
		else {
			advisories.defuse = -1
		}
	}
	else {
		advisories.planting = -1
		advisories.defuse = -1
	}

	updateAdvisory()
})
