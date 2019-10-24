// let config = {}

let socket = {
	connected: false,
	connect: () =>  {
		if (navigator.userAgent.toLowerCase().indexOf(" electron/") > -1) {
			global.config = require("../loadconfig")()
			let websocket = new WebSocket(`ws://127.0.0.1:${global.config.browser.ports.socket}`)
			attachEvents(websocket)
		}
		else {
			fetch(window.location.origin + "/doorknock")
			.then(resp => resp.json())
			.then(data => {
				let websocket = new WebSocket(`ws://${window.location.hostname}:${data.socket}`)
				attachEvents(websocket)

				if (document.getElementById("version") && document.getElementById("version").innerHTML == "") {
					document.getElementById("version").innerHTML = "version " + data.version
				}

				console.info(`%cBoltobserv %cv${data.version}%c, at your service ❤ `, "font-weight: bold", "font-weight: bold; color:red", "font-weight: bold", "https://github.com/boltgolt/boltobserv/")
			})
			.catch((err) => {
				console.error(err)

				socket.connected = false
				setTimeout(() => {
					socket.connect()
				}, 25)
			})
		}

		function attachEvents(websocket) {
			websocket.onopen = () => {
				socket.connected = true
			}

			websocket.onmessage = event => {
				let incom = JSON.parse(event.data)
				let outev = new Event(incom.type)
				outev.data = incom.data
				socket.element.dispatchEvent(outev)
			}

			websocket.onclose = event => {
				socket.connected = false
				setTimeout(() => {
					socket.connect()
				}, 25)
			}

			websocket.onerror = error => {
				socket.close()
			}
		}
	},

	element: document.createElement("div")
}

socket.connect()

window.addEventListener("DOMContentLoaded", () => {
	// If not electron (browser)
	if (navigator.userAgent.toLowerCase().indexOf(" electron/") <= -1) {
		// Reload the site when a new HTML page has been rendered
		socket.element.addEventListener("pageUpdate", event => {
			location.reload()
		})
	}
})
