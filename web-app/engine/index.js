const bus = require('../bus')
const { handleGithubEvent } = require('./event-handlers')
const server = require('./server')

module.exports = { start }

function start () {
	bus.on('github event', handleGithubEvent)
	server.create().listen(3002, 'localhost')
}