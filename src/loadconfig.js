const fs = require("fs")
const JSON5 = require("json5")
const path = require("path")
const util = require("util")
const pack = require("./package.json")

/**
 * Copy deep object values into target object
 * @param  {Object} core      Target object
 * @param  {Object} override  Source object
 */
function deepCopyObject(core, override) {
	// For each core property
	for (let prop in core) {
		// Check if the prop is an deeper object, run this function recursively on it if it is
		if (typeof core[prop] == "object") {
			deepCopyObject(core[prop], override[prop])
			continue
		}

		// Otherwise, if the prop is set in both the core and overwrite, set it to the overwrite value
		if (typeof override[prop] != 'undefined') {
			core[prop] = override[prop]
		}
	}
}

// Load the default config
let loadedConfig = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "config.json5"), "utf8"))

if (pack.version != loadedConfig._version) {
	console.warn(`WARNING config.json version missmatch (radar v${pack.version}, config v${loadedConfig._version})`)
}

// If there is an overwrite config file
if (fs.existsSync(path.join(__dirname, "config", "config.override.json5"))) {
	// Read the overwrite file
	let override = JSON5.parse(fs.readFileSync(path.join(__dirname, "config", "config.override.json5"), "utf8"))
	// Set any settings in the core config to the override ones
	deepCopyObject(loadedConfig, override)
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
