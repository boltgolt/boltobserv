const electron = require("electron")
const app = electron.app

function createWindow () {
  // Create the browser window.
  let win = new electron.BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  win.loadFile("index.html")
}

app.on("ready", createWindow)
