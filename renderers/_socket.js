// Websocket implementation
//
// Starts a connection to the server and emits events for other scripts to
// listen for.

let socket = {
	native: null,
	connected: false,
	connect: () => {
		console.log('running');

		function attachEvents(websocket) {
			// Called when the socket is started
			socket.native = websocket;
			websocket.onopen = () => {
				socket.connected = true
				websocket.send("requestWelcome")
			}

			// Called when the server has pushed a message to us
			websocket.onmessage = event => {
				// Decode the message
				let incom = JSON.parse(event.data)
				// Create a new event with the given event type
				let outev = new Event(incom.type)
				// Add the data we got to the new event
				outev.data = incom.data
				// Send the event to other scripts
				socket.element.dispatchEvent(outev)
			}

			// Called when the socket is closed, try opening the socket again in 25ms
			websocket.onclose = event => {
				socket.connected = false
				setTimeout(() => {
					socket.connect()
				}, 25)
			}

			// Called when a handler errors out, close the socket and start clean
			websocket.onerror = err => {
				console.error(err)
				socket.close()
			}
		}
	},

	// Dummy element, events are fired from here
	element: document.createElement("div")
}

let serverAddress = 'http://localhost:4400/?client=main'
if (window.location.hash)
	serverAddress = 'http://' + window.location.hash.substring(1)
iosocket = io(serverAddress)
const token = serverAddress.substring(serverAddress.indexOf('=')).slice(1);
console.log(token)
iosocket.on('connect', () => {
	socket.connect()
	iosocket.emit(`subscribe`, `${token}_OverlayRadar`)

	iosocket.on(`${token}_OverlayRadar`, (data) => {
		translateData(data)
	})
})

// On a round indicator packet
socket.element.addEventListener("round", event => {
	let phase = event.data

	// Abort if there's no change in phase
	if (global.gamePhase == phase) return

	console.log('New phase:', phase);

	// If the round has ended
	if ((phase == "freezetime" && global.gamePhase == "over") || (phase == "live" && global.gamePhase == "over")) {
		// Emit a custom event
		let roundend = new Event("roundend")
		socket.element.dispatchEvent(roundend)
	}

	// Set the new phase
	global.gamePhase = phase
})

socket.element.addEventListener("effect", event => {
	global.effects[event.data.key] = event.data.value
})
