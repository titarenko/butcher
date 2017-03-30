const Promise = require('bluebird')
const engine = require('./engine')
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { server, router, security } = require('buhoi')
const config = require('./config')

const ports = {
	http: 3000,
	https: 3001,
	engine: 3002,
}

Promise.longStackTraces()

engine.listen(ports.engine)

const app = express()

app.use(cookieParser())
app.use(authentication)
app.use(bodyParser.json({ verify: assignRawBody }))
app.use('/api', router({ basePath: `${__dirname}/pages` }))
app.use(express.static(`${__dirname}/static`))
app.use(fallback)

if (process.env.NODE_ENV == 'development') {
	const httpServer = server.http(app).listen(ports.http)
	process.on('SIGINT', () => httpServer.shutdown())
} else {
	const httpServer = server.http({ redirectToHttps: true }).listen(ports.http)
	const httpsServer = server.https(app, { letsencrypt: '/etc/certs' }).listen(ports.https)
	process.on('SIGINT', () => {
		httpServer.shutdown()
		httpsServer.shutdown()
	})
}

function authentication (req, res, next) {
	req.user = security.deserialize(req.cookies.user, config.webApp.secret)
	next()
}

function assignRawBody (req, res, buffer, encoding) {
	req.rawBody = buffer.toString(encoding)
}

function fallback (req, res) {
	res.sendFile(`${__dirname}/static/index.html`)
}