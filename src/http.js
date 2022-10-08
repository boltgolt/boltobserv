const express = require("express")
const path = require("path")
const fs = require("fs")

const version = require("./package.json").version
const config = require("./loadconfig")

const host = "localhost"

let app = express()

app.use((req, res, next) => {
	res.header("Cache-Control", "no-cache")
	res.setHeader("X-Powered-By", `Boltobserv ${version} <github.com/boltgolt/boltobserv>`)
	next()
})

app.get("/favicon.ico", (req, res) => {res.sendFile(path.join(__dirname, "img", "favicon.ico"))})

for (let dir of ["css", "renderers", "img", "maps"]) {
	app.use(`/${dir}`, express.static(path.join(__dirname, dir)))
}

let activePage = "waiting"
process.on("message", data => {
	activePage = data
})

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "html", activePage + ".html"))
})

function handleCheck(req, res) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

	res.json({
		"type": "boltgolt/boltobserv",
		"version": version,
		"socket": config.browser.ports.socket,
		"activePage": activePage,
		"configPath": path.join(__dirname, "config")
	})
}

app.options("/doorknock", handleCheck)
app.get("/doorknock", handleCheck)

app.listen(config.browser.ports.static)
console.info(`Browser view enabled at http://${host}:${config.browser.ports.static}`)
