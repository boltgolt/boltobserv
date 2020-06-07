const fs = require("fs")
const JSON5 = require("json5")
const path = require("path")
const util = require("util")
const pack = require("./package.json")

let cachedConfig = false
// Load the default config
let loadedConfig = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "config.json5"), "utf8"))

if (pack.version != loadedConfig._version) {
	console.warn(`WARNING config.json version missmatch (radar v${pack.version}, config v${loadedConfig._version})`)
}

// If there is an overwrite config file
if (fs.existsSync(path.join(__dirname, "config", "config.override.json5"))) {
	// Read the overwrite file
	let override = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "config.override.json5"), "utf8"))
	// Merge the configs
	Object.assign(loadedConfig, override)
}

// Show config in console if enabled
if (loadedConfig.debug.printConfig) {
	console.info("Loaded config:", util.inspect(loadedConfig, {
		showHidden: true,
		depth: Infinity,
		colors: true,
		compact: false
	}))
}

// Return the merged configs
module.exports = loadedConfig
