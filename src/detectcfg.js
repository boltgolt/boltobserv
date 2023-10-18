const fs = require("fs")
const path = require("path")
const steamPath = require("steam-game-path")

module.exports = {
	found: [],
	search: () => {
		let result = steamPath.getGamePath(730)
		if (result && result.game && fs.existsSync(result.game.path)) {
			console.info("Found installation in", result.game.path)

			let configPath = path.join(result.game.path, "game", "core", "cfg", "gamestate_integration_boltobserv.cfg")

			if (fs.existsSync(configPath)) {
				let foundHeader = fs.readFileSync(configPath, "utf8").split("\n")[0]
				let ownHeader = fs.readFileSync(path.join(__dirname, "gamestate_integration_boltobserv.cfg"), "utf8").split("\n")[0]

				if (foundHeader != ownHeader) {
					module.exports.found.push({
						type: "update",
						path: result.game.path
					})
				}
			}
			else {
				module.exports.found.push({
					type: "install",
					path: result.game.path
				})
			}
		}
	},

	install: (target) => {
		let template = path.join(__dirname, "gamestate_integration_boltobserv.cfg")
		let dest = path.join(target, "game", "core", "cfg", "gamestate_integration_boltobserv.cfg")
		fs.copyFileSync(template, dest)

		console.info("Installed config file as", dest)
	}
}
