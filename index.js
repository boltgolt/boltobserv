// ==============================================================================
//
//                              PLEASE READ:
// This project is under a GPL-3 license, you are REQUIRED to publish any changes
// or upgrades you make to the codebase, it strengthens the community.
// Contact me if you have any questions regarding the license.
//
// ==============================================================================

const path = require("path")
const child_process = require("child_process")

const config = require("./loadconfig")()
const detectcfg = require("./detectcfg")

let hasMap = false
let connTimeout = false
var win = false

let gsi = child_process.fork(`${__dirname}/gsi.js`)
let http = child_process.fork(`${__dirname}/http.js`)
let socket = child_process.fork(`${__dirname}/socket.js`)

function setActivePage(page, win) {
	win.loadFile(`html/${page}.html`)
	http.send(page)

	socket.send({
		type: "pageUpdate"
	})
}

function createWindow() {
	let winConfig = {
		width: config.window.defaultSize.width,
		height: config.window.defaultSize.height,
		fullscreen: config.window.fullscreen,
		minHeight: 200,
		minWidth: 200,
		frame: false,
		resizable: true,
		hasShadow: false,
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

	if (!config.window.enable) {
		winConfig.width = 450
		winConfig.height = 200
		winConfig.fullscreen = false
		winConfig.resizable = false
	}

	win = new electron.BrowserWindow(winConfig)

	if (config.window.alwaysOnTop) {
		win.setAlwaysOnTop(true, "screen")
	}

	if (config.window.mousePassthrough) {
		win.setIgnoreMouseEvents(true)
	}

	if (config.window.fullscreen) {
		win.setFullScreen(true)
	}

	win.on("closed", () => {
		gsi.kill()
		app.quit()
	})

	if (!config.window.enable) {
		win.loadFile("html/status.html")
	}
	else {
		win.loadFile("html/waiting.html")
	}

	electron.ipcMain.on("reqInstall", (event) => {
		event.sender.send("cfgInstall", detectcfg.found)
	})

	electron.ipcMain.on("install", (event, path) => {
		detectcfg.install(path)
	})

	// Capture file requests and redirect them to on-disk paths
	electron.protocol.interceptFileProtocol("file", (request, callback) => {
		let loc = request.url.substr(5)

		// Remove drive letter on windows
		loc = loc.replace(/\w:\//, "")

		if (request.url.match(/^.*?\/html\/\w*?.html/)) {
			loc = request.url.replace(/^.*?\/html\/(\w*?).html/, "html/$1.html")
		}

		callback({
			path: path.normalize(path.join(__dirname, loc))
		})
	})
}

if (config.game.installCfg) detectcfg.search()

gsi.on("message", (message) => {
	socket.send(message)

	if (message.type == "connection") {
		if (message.data.status == "up" && connTimeout === false && config.game.connectionTimout >= 0) {
			console.info("CSGO has pinged server, connection established")
		}
	}
	else if (!hasMap) {
		if (message.type == "map") {
			setActivePage("map", win)
			hasMap = true

			console.info(`Map ${message.data} selected`)
		}
	}

	if (config.game.connectionTimout >= 0) {
		clearTimeout(connTimeout)
		connTimeout = setTimeout(() => {
			hasMap = false
			setActivePage("waiting", win)
		}, config.game.connectionTimout * 1000)
	}
})

if (!config.debug.terminalOnly) {
	// Needs to be a var so it's inherited by createWindow
	var electron = require("electron")
	var app = electron.app

	if (config.window.disableGpu) {
		console.info("GPU disabled by config option")

		app.disableHardwareAcceleration()
		app.commandLine.appendSwitch("disable-gpu")
	}

	app.on("ready", createWindow)
}
else {
	console.info("Not opening window, terminal only mode is enabled")
}
