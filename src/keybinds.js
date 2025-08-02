const fs = require("fs")
const JSON5 = require("json5")
const path = require("path")
const electron = require("electron")

let win = false
let socket = false
let effects = {}

function executeAction(subject, command) {		// comman is toggle,   subject is window.fullscreen
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
    // If binds is not an array, convert it to one
    if (!Array.isArray(binds)) {
        binds = [binds];
    }
    
    // If there are no more binds to process, return
    if (binds.length === 0) return;
    
    // Get the current bind and remove it from the array
    let bind = binds.shift();
    
    let actionRegex = /([\w\.]*?)\s?->\s?(\w*)/;
    let functionRegex = /([\w\.]*?)\((.*?)\)/;

    if (bind.match(actionRegex)) {
        let parsed = actionRegex.exec(bind);
        executeAction(parsed[1], parsed[2]);
        
        // Process remaining binds
        if (binds.length > 0) parseBind(binds);
    }
    else if (bind.match(functionRegex)) {
        let parsed = functionRegex.exec(bind);
        let argument = parsed[2];

        switch (parsed[1]) {
            case "functions.sleep":
                setTimeout(() => {
                    if (binds.length > 0) parseBind(binds);
                }, argument * 1000);
                break;

            case "functions.reload":
                win.reload();
                socket.send({
                    type: "pageUpdate"
                });
                
                setTimeout(() => {
                    if (binds.length > 0) parseBind(binds);
                }, 100);
                break;

            case "window.width":
                win.setSize(Math.max(0, parseInt(argument)), win.getSize()[1]);
                if (binds.length > 0) parseBind(binds);
                break;
                
            case "window.height":
                win.setSize(win.getSize()[0], Math.max(0, parseInt(argument)));
                if (binds.length > 0) parseBind(binds);
                break;

            case "window.left":
                win.setBounds({x: parseInt(argument)});
                if (binds.length > 0) parseBind(binds);
                break;
                
            case "window.top":
                win.setBounds({y: parseInt(argument)});
                if (binds.length > 0) parseBind(binds);
                break;

            default:
                console.warn(`WARNING: Unknown keybind function in keybind "${bind}"`);
                if (binds.length > 0) parseBind(binds);
                break;
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