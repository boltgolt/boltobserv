const WebSocket = require("ws")

const config = require("./loadconfig")()
const wss = new WebSocket.Server({
	port: config.browser.ports.socket
})

console.log(config.browser.ports.socket)

wss.on("connection", ws => {
	console.log("in")
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});
