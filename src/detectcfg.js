const fs = require("fs")
const path = require("path")

const steamPaths = [
	// Default Windows install path
	path.join("C:", "Program Files (x86)", "Steam", "steamapps"),
	// For development
	path.join(__dirname)
]

module.exports = {
	found: [],
	search: () => {
		let exp = /"\d"\s*"(.*)"/g
		let commonPaths = []

		for (let steamPath of steamPaths) {
			let vdfPath = path.join(steamPath, "libraryfolders.vdf")

			commonPaths.push(path.join(steamPath, "common"))

			if (fs.existsSync(vdfPath)) {
				let vdfContent = fs.readFileSync(vdfPath, "utf8")

				let appPath = exp.exec(vdfContent)

				while (appPath != null) {
					commonPaths.push(path.join(appPath[1], "steamapps", "common"))
					appPath = exp.exec(vdfContent)
				}
			}
		}

		for (let commonPath of commonPaths) {
			let gamePath = path.join(commonPath, "Counter-Strike Global Offensive")

			if (fs.existsSync(gamePath)) {
				console.info("Found installation in", gamePath)

				let configPath = path.join(gamePath, "csgo", "cfg", "gamestate_integration_boltobserv.cfg")

				if (fs.existsSync(configPath)) {
					let foundHeader = fs.readFileSync(configPath, "utf8").split("\n")[0]
					let ownHeader = fs.readFileSync(path.join(__dirname, "gamestate_integration_boltobserv.cfg"), "utf8").split("\n")[0]

					if (foundHeader != ownHeader) {
						module.exports.found.push({
							type: "update",
							path: gamePath
						})
					}
				}
				else {
					module.exports.found.push({
						type: "install",
						path: gamePath
					})
				}
			}
		}
	},

	install: (target) => {
		let template = path.join(__dirname, "gamestate_integration_boltobserv.cfg")
		let dest = path.join(target, "csgo", "cfg", "gamestate_integration_boltobserv.cfg")
		fs.copyFileSync(template, dest)

		console.info("Installed config file as", dest)
	}
}
