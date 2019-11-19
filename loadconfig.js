const fs = require("fs")
const JSON5 = require("json5")
const path = require("path")
const util = require("util")

let cachedConfig = false

module.exports = () => {
	if (cachedConfig !== false) return cachedConfig

	let loadedConfig = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "config.json5"), "utf8"))

	if (fs.existsSync(path.join(__dirname, "config", "config.override.json5"))) {
		let override = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "config.override.json5"), "utf8"))
		Object.assign(loadedConfig, override)
	}

	if (loadedConfig.debug.printConfig) {
		console.info("Loaded config:", util.inspect(loadedConfig, {
			showHidden: true,
			depth: Infinity,
			colors: true,
			compact: false
		}))
	}

	cachedConfig = loadedConfig
	return loadedConfig
}
