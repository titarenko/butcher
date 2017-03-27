const net = require('net')
const agents = require('./agents')
const log = require('totlog')(__filename)

module.exports = { create }

function create () {
	return net.createServer(socket => {
		socket.addListener('data', authenticate)
		function authenticate (data) {
			const { type, name, token } = JSON.parse(data.toString())
			if (type != 'AUTH') {
				return
			}
			agents.add({ name, token, socket })
				.catch(error => log.error(`authentication interrupted due to ${error.stack}`))
				.finally(() => socket.removeListener('data', authenticate))
		}
	})
}