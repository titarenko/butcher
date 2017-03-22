const net = require('net')
const agents = require('./agents')
const log = require('totlog')(__filename)

const server = net.createServer(socket => {
	socket.addListener('data', data => authenticate(socket, data))
})

server.listen(3001, 'localhost')

function authenticate (data) {
	const command = JSON.parse(data.toString())
	const { type, role, password, repository, branch } = command
	if (type != 'AUTHENTICATE') {
		return
	}
	verifyCredentials(command)
		.then(valid => valid ? addAgent(socket) : undefined)
		.catch(e => log.error(`authentication interrupted due to ${error.stack}`))
}

function verifyCredentials ({ role, password, repository, branch }) {
	return pg('credentials')
		.where({ role, password })
		.where(function () {
			this.whereNull('repository').orWhere({ repository })
		})
		.where(function () {
			this.whereNull('branch').orWhere({ branch })
		})
		.first()
		.then(Boolean)
}

function addAgent (socket) {
	socket.removeListener('data', authenticate)

	socket.on('close', () => agents.remove(socket))
	socket.on('error', error => {
		log.error(`connection from ${socket.remoteAddress}:${socket.remotePort} failed due to ${error.stack}`)
		agents.remove(socket)
		socket.destroy()
	})

	agents.add(socket)
}