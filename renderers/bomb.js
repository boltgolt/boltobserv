// Bomb rendering
//
// Shows dropped and planted bomb.

let bombElement = document.getElementById("bomb")
let bombStyle = bombElement.style

socket.element.addEventListener("bomb", event => {
	let bomb = event.data

	if (bomb.state == "carried" || bomb.state == "exploded") {
		bombStyle.display = "none"
	}
	else {
		bombStyle.display = "block"
		bombStyle.left = global.positionToPerc(bomb.position, "x") + "%"
		bombStyle.bottom = global.positionToPerc(bomb.position, "y") + "%"
	}

	if (bomb.state == "planted" || bomb.state == "defusing") {
		bombElement.className = "planted"
	}
	else if (bomb.state == "defused") {
		bombElement.className = "defused"
	}
	else {
		bombElement.className = ""
	}
})
