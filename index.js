const path = require("path")
const electron = require("electron")
const events = require("events")
const child_process = require('child_process')

const app = electron.app
global.bus = new events.EventEmitter()

function createWindow () {
	let win = new electron.BrowserWindow({
		width: 600,
		height: 600,
		frame: false,
		resizable: true,
		nodeIntegration: false,
		icon: path.join(__dirname, "img/icon-64x64.png")
	})

	win.loadFile("html/waiting.html")

	let http = child_process.fork(`${__dirname}/http.js`)

	http.on("message", (message) => {
		bus.emit(message.type, message.data)
		console.log(message)
	})

	// app.server = require("./http.js")

}

app.on("ready", createWindow)
