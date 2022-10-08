const path = require("path")
const config = require("./loadconfig")

const detectcfg = require("./detectcfg")
if (config.game.installCfg && !config.debug.terminalOnly) detectcfg.search()

module.exports = {
	electron: false,
	app: false,
	gsi: false,
	http: false,
	socket: false,
	win: false,

	build: () => {
		module.exports.electron = require("electron")
		module.exports.app = module.exports.electron.app

		if (config.window.disableGpu) {
			console.info("GPU disabled by config option")

			module.exports.app.disableHardwareAcceleration()
			module.exports.app.commandLine.appendSwitch("disable-gpu")
		}

		module.exports.app.on("ready", module.exports.create)
	},

	create: () => {
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
				contextIsolation: false,
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
			winConfig.backgroundColor = config.window.backgroundColor
		}

		if (config.window.backgroundColor && !config.window.transparent) {
			winConfig.backgroundColor = config.window.backgroundColor
		}

		if (config.window.disable) {
			winConfig.width = 450
			winConfig.height = 200
			winConfig.fullscreen = false
			winConfig.resizable = false
		}

		win = new module.exports.electron.BrowserWindow(winConfig)
		module.exports.win = win

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
			module.exports.gsi.kill()
			module.exports.http.kill()
			module.exports.socket.kill()
			module.exports.app.quit()
			process.exit()
		})

		if (config.window.disable) {
			win.loadFile("html/status.html")
		}
		else {
			win.loadFile("html/waiting.html")
		}

		module.exports.electron.ipcMain.on("reqInstall", (event) => {
			event.sender.send("cfgInstall", detectcfg.found)
		})

		module.exports.electron.ipcMain.on("install", (event, path) => {
			detectcfg.install(path)
		})

		// Capture file requests and redirect them to on-disk paths
		module.exports.electron.protocol.interceptFileProtocol("file", (request, callback) => {
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

		// Load key-binds and start listening
		require("./keybinds")(module.exports.socket, module.exports.win)
	}
}
