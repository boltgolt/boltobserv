const crypto = require("crypto")
const https = require("https")

let collectedNades = []
let flyingNades = []
let activeMap = false

function getNade(arr, id, nade) {
	return arr.filter((fnade) => {
		return fnade.id == id && fnade.type == nade.type && fnade.owner == nade.owner
	})
}

module.exports = {
	setMap: (map) => {
		if (activeMap != map) {
			collectedNades = []
			flyingNades = []
			activeMap = map
		}
	},

	event: (nades) => {
		let reportedNades = []
		for (let id in nades) {
			let nade = nades[id]

			if (nade.effecttime > 0.0) continue
			if (nade.type == "inferno" || nade.type == "flashbang") continue

			let flyingNade = getNade(flyingNades, id, nade)

			if (flyingNade.length > 0) {
				flyingNade[0].lastPos = nade.position
			}
			else {
				flyingNades.push({
					id: id,
					type: nade.type,
					owner: nade.owner,
					firstPos: nade.position,
					firstVelo: nade.velocity,
					lastPos: nade.position
				})
			}

			reportedNades.push(id)
		}

		let toBeSpliced = []
		for (let i in flyingNades) {
			if (!reportedNades.includes(flyingNades[i].id)) {
				collectedNades.push(flyingNades[i])
				toBeSpliced.push(i)
			}
		}

		for (let i of toBeSpliced) {
			flyingNades.splice(i, 1)
		}
	},

	send: () => {
		if (collectedNades.length == 0) return

		let pack = []

		for (let nade of collectedNades) {
			let ownerPosition = nade.firstPos.split(", ")
			let ownerAngle = nade.firstVelo.split(", ")
			let nadePosition = nade.lastPos.split(", ")
			let idHash = crypto.createHash("sha256")

			// Data hashed here is only to uniquely identify this nade, and is impossible to recover after it's hashed
			// This prevents multiple people observing the same game from reporting duplicates
			idHash.update(activeMap)
			idHash.update(nade.id)
			idHash.update("own" + nade.owner)

			pack.push({
				id: idHash.digest("hex"),
				map: activeMap,
				type: nade.type,
				owner: {
					position: {
						x: parseFloat(ownerPosition[0]),
						y: parseFloat(ownerPosition[1]),
						z: parseFloat(ownerPosition[2])
					},
					angle: {
						x: parseFloat(ownerAngle[0]),
						y: parseFloat(ownerAngle[1]),
						z: parseFloat(ownerAngle[2])
					}
				},
				nade: {
					position: {
						x: parseFloat(nadePosition[0]),
						y: parseFloat(nadePosition[1]),
						z: parseFloat(nadePosition[2])
					}
				}
			})
		}

		let req = https.request({
			hostname: "nades.boltgolt.nl",
			port: 443,
			path: "/",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": JSON.stringify(pack).length
			}
		}, (res) => {
			// res.on("data", (d) => {
			// 	process.stdout.write(d)
			// })
		})

		req.on("error", (error) => {
			console.error("Nade collection error:", error)
		})

		req.write(JSON.stringify(pack))
		req.end()

		collectedNades = []
	}
}
