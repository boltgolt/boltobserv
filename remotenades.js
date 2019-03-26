let collectedNades = []
let flyingNades = []

module.exports = (nades) => {
	function isIn(arr, id, nade) {
		return arr.filter((fnade) => {
			return fnade.id == id && fnade.type == nade.type && fnade.owner == nade.owner
		}).length > 0
	}

	for (let id in nades) {
		let nade = nades[id]

		// console.log(isIn(collectedNades, id, nade))
		if (isIn(collectedNades, id, nade)) return

		// console.log(nade)

		collectedNades.push({
			id: id,
			type: nade.type,
			owner: nade.owner
		})

		// if (nade.type == "firebomb") {
		//
		// }
	}
	// console.log(nades)
}
