const path = require("path")
const electron = require("electron")
const app = electron.app

function createWindow () {
  let win = new electron.BrowserWindow({
		width: 600,
		height: 600,
		frame: false,
		resizable: true,
		nodeIntegration: false,
		icon: path.join(__dirname, "img/icon-64x64.png")
  })

  // and load the index.html of the app.
  win.loadFile("index.html")
}

app.on("ready", createWindow)
