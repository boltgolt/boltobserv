const express = require("express")
const path = require("path")

const config = require("./loadconfig")()

const host = "localhost"

let app = express()

app.use("/", express.static(path.join(__dirname, "html")))

for (let dir of ["style", "renderers", "img", "maps"]) {
	app.use(`/${dir}`, express.static(path.join(__dirname, dir)))
}

app.get("/", (req, res) => {
	res.status(302).redirect("/waiting.html")
})

function handleCheck(req, res) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

	res.json({
		"type": "boltgolt/boltobserv",
		"socket": config.browser.ports.socket
	})
}

app.options("/doorknock", handleCheck)
app.get("/doorknock", handleCheck)

app.listen(config.browser.ports.static);
console.info(`Browser view enabled at http://${host}:${config.browser.ports.static}`)
