const fs = require("fs")
const JSON5 = require("json5")
const path = require("path")
const electron = require("electron")

let win = false
let socket = false
let effects = {}

function executeAction(subject, command) {
	switch (command) {
		case "toggle":
			if (typeof effects[subject] == "undefined") effects[subject] = false
			effects[subject] = !effects[subject]
			break

		case "on":
		case "true":
			effects[subject] = true
			break

		case "off":
		case "false":
			effects[subject] = false
			break

		default:
			console.warn(`WARNING: Unkown keybind command in keybind "${subject}:${command}"`)
			return
	}

	socket.send({
		type: "effect",
		data: {
			key: subject,
			value: effects[subject]
		}
	})

	switch (subject) {
		case "window.fullscreen":
			win.setFullScreen(effects[subject])
			break
		case "window.mousePassthrough":
			win.setIgnoreMouseEvents(effects[subject])
			break
	}
}


function parseBind(binds) {
	function nextBind(binds) {
		if (binds.length > 0) parseBind(binds)
	}

	let bind = binds

	if (typeof binds == "object") {
		bind = binds[0]
		binds.shift()
	}

	let actionRegex = /([\w\.]*?)\s?->\s?(\w*)/
	let functionRegex = /([\w\.]*?)\((.*?)\)/

	if (bind.match(actionRegex)) {
		let parsed = actionRegex.exec(bind)
		executeAction(parsed[1], parsed[2])

		if (binds.length > 0) parseBind(binds)
	}
	else if (bind.match(functionRegex)) {
		let parsed = functionRegex.exec(bind)
		let argument = parsed[2]

		switch (parsed[1]) {
			case "functions.sleep":
				setTimeout(() => {
					if (binds.length > 0) parseBind(binds)
				}, argument * 1000)
				break

			case "functions.reload":
				// Reload both electron window and browsers
				win.reload()
				socket.send({
					type: "pageUpdate"
				})

				// Wait a second for everything to load before executing the next action
				setTimeout(() => {
					if (binds.length > 0) parseBind(binds)
				}, 100)
				break

			case "window.width":
				win.setSize(Math.min(0, argument), win.getSize()[1])
				return nextBind(binds)
			case "window.height":
				win.setSize(win.getSize()[0], Math.min(0, argument))
				return nextBind(binds)

			case "window.left":
				win.setBounds({x: parseInt(argument)})
				return nextBind(binds)
			case "window.top":
				win.setBounds({y: parseInt(argument)})
				return nextBind(binds)

			default:
				console.warn(`WARNING: Unkown keybind function in keybind "${bind}"`)
				return
		}
	}
}

module.exports = (_socket, _win) => {
	win = _win
	socket = _socket

	let rawArr = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "keybinds.json5"), "utf8"))

	if (fs.existsSync(path.join(__dirname, "config", "keybinds.override.json5"))) {
		let override = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "keybinds.override.json5"), "utf8"))
		Object.assign(rawArr, override)
	}

	for (let rawBind in rawArr) {
		if (electron.globalShortcut.isRegistered(rawBind)) {
			console.warn(`WARNING: Keybind "${rawBind}" is already used, registering anyway`)
		}

		try {
			let registered = electron.globalShortcut.register(rawBind, () => {
				parseBind(rawArr[rawBind])
			})

			if (!registered) {
				console.warn(`WARNING: Keybind "${rawBind}" could not be registered`)
			}
		} catch (e) {
			console.warn(`WARNING: Error while registering Keybind "${rawBind}"`)
		}
	}

	let count = Object.keys(rawArr).length
	if (count > 0) console.info(`Registered ${count} ${count == 1 ? "keybind" : "keybinds"} with the OS`)
}
