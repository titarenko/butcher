const bus = require('../bus')
const { handleGithubEvent } = require('./event-handlers')
const server = require('./server')

module.exports = { listen }

function listen (port) {
	bus.on('github event', handleGithubEvent)
	server.create().listen(port)
}