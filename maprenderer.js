const renderer = require("electron").ipcRenderer

let currentMap = "none"

renderer.on("map", (event, data) => {
	if (currentMap == data) return
	document.getElementById("radar").src = `../img/maps/${data}.png`
})
