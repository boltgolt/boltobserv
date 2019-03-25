const path = require("path")
const electron = require("electron")
const child_process = require("child_process")
const fs = require("fs")
const JSON5 = require("json5")

const app = electron.app
const config = JSON5.parse(fs.readFileSync(path.join(__dirname, "config.json5"), "utf8"))

console.info("Loaded config:", config)

let hasMap = false
let connTimeout = false

function createWindow () {
	let win = new electron.BrowserWindow({
		width: 600,
		height: 600,
		minHeight: 200,
		minWidth: 200,
		frame: false,
		resizable: true,
		enableLargerThanScreen: true,
		darkTheme: true,
		title: "Boltobserv",
		backgroundColor: "#000",
		icon: path.join(__dirname, "img/icon-64x64.png"),
		webPreferences: {
			nodeIntegration: true,
			webaudio: false,
			webgl: false
		}
	})

	if (config.window.alwaysOnTop) {
		win.setAlwaysOnTop(true, "screen")
	}

	win.on("closed", () => {
		http.kill()
		app.quit()
	})

	win.loadFile("html/waiting.html")

	let http = child_process.fork(`${__dirname}/http.js`)

	http.on("message", (message) => {
		win.webContents.send(message.type, message.data)

		if (message.type == "connection") {
			if (message.data.status == "up" && connTimeout === false) {
				// console.info("CSGO has pinged server, connection established")
			}
		}
		else if (!hasMap) {
			if (message.type == "map") {
				win.loadFile("html/map.html")
				console.info(`Map ${message.data} selected`)

				win.webContents.on("did-finish-load", () => {
					win.webContents.send(message.type, message.data)
				})

				hasMap = true
			}
		}

		// clearTimeout(connTimeout)
		// connTimeout = setTimeout(() => {
		// 	hasMap = false
		// 	win.loadFile("html/waiting.html")
		// }, 10000)
	})
}

app.on("ready", createWindow)
