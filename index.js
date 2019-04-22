const path = require("path")
const electron = require("electron")
const child_process = require("child_process")

const app = electron.app
const config = require("./loadconfig")(true)
const detectcfg = require("./detectcfg")

let hasMap = false
let connTimeout = false

function createWindow() {
	let winConfig = {
		width: config.window.defaultSize.width,
		height: config.window.defaultSize.height,
		minHeight: 200,
		minWidth: 200,
		frame: false,
		resizable: true,
		enableLargerThanScreen: true,
		darkTheme: true,
		title: "Boltobserv",
		icon: path.join(__dirname, "img/icon-64x64.png"),
		webPreferences: {
			nodeIntegration: true,
			webaudio: false,
			webgl: false,
			backgroundThrottling: false,
			allowEval: false
		}
	}

	if (config.window.defaultSize.top >= 0 || config.window.defaultSize.left >= 0) {
		winConfig.x = Math.max(0, config.window.defaultSize.left)
		winConfig.y = Math.max(0, config.window.defaultSize.top)
	}

	if (config.window.transparent) {
		winConfig.transparent = true
	}
	else {
		winConfig.backgroundColor = "#000"
	}

	let win = new electron.BrowserWindow(winConfig)

	if (config.window.alwaysOnTop) {
		win.setAlwaysOnTop(true, "screen")
	}

	win.on("closed", () => {
		http.kill()
		app.quit()
	})

	win.loadFile("html/waiting.html")

	if (config.game.installCfg) detectcfg.search()

	let http = child_process.fork(`${__dirname}/http.js`)

	http.on("message", (message) => {
		win.webContents.send(message.type, message.data)

		if (message.type == "connection") {
			if (message.data.status == "up" && connTimeout === false && config.game.connectionTimout >= 0) {
				console.info("CSGO has pinged server, connection established")
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

		if (config.game.connectionTimout >= 0) {
			clearTimeout(connTimeout)
			connTimeout = setTimeout(() => {
				hasMap = false
				win.loadFile("html/waiting.html")
			}, config.game.connectionTimout * 1000)
		}
	})

	electron.ipcMain.on("reqInstall", (event) => {
		event.sender.send("cfgInstall", detectcfg.found)
	})

	electron.ipcMain.on("install", (event, path) => {
		detectcfg.install(path)
	})
}

if (config.window.disableGpu) {
	console.info("GPU disabled by config option")

	app.disableHardwareAcceleration()
	app.commandLine.appendSwitch("disable-gpu")
}

app.on("ready", createWindow)
