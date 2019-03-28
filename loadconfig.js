const fs = require("fs")
const JSON5 = require("json5")
const path = require("path")
const util = require("util")

module.exports = (mainProcess) => {
	let loadedConfig = JSON5.parse(fs.readFileSync(path.join(__dirname, "config.json5"), "utf8"))

	if (fs.existsSync(path.join(__dirname, "config.override.json5"))) {
		let override = JSON5.parse(fs.readFileSync(path.join(__dirname, "config.override.json5"), "utf8"))
		Object.assign(loadedConfig, override)
	}

	if (loadedConfig.debug.printConfig && mainProcess === true) {
		console.info("Loaded config:", util.inspect(loadedConfig, {
			showHidden: true,
			depth: Infinity,
			colors: true,
			compact: false
		}))
	}

	return loadedConfig
}
