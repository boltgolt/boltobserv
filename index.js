const path = require("path")
const electron = require("electron")
const child_process = require('child_process')

const app = electron.app

let hasMap = false

function createWindow () {
	let win = new electron.BrowserWindow({
		width: 600,
		height: 600,
		minHeight: 100,
		minWidth: 100,
		frame: false,
		resizable: true,
		nodeIntegration: false,
		enableLargerThanScreen: true,
		darkTheme: true,
		title: "Boltobserv",
		backgroundColor: "#000",
		icon: path.join(__dirname, "img/icon-64x64.png"),

		webPreferences: {
			nodeIntegration: true
		}
	})

	win.loadFile("html/waiting.html")

	let http = child_process.fork(`${__dirname}/http.js`)

	http.on("message", (message) => {
		win.webContents.send(message.type, message.data)

		if (message.type == "connection") {
			if (message.data.status == "up") {
				console.info("CSGO has pinged server, connection established")
			}
		}
		else if (!hasMap) {
			if (message.type == "map") {
				win.loadFile("html/map.html")
				console.info(`Map ${message.data} selected`)

				win.webContents.on("did-finish-load", () => {
					console.log("load")
					win.webContents.send(message.type, message.data)
				})

				hasMap = true
			}
		}

		// console.log(message)
	})
}

app.on("ready", createWindow)
