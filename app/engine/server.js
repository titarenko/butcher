const net = require('net')
const pg = require('../pg')
const agents = require('./agents')
const log = require('totlog')(__filename)

module.exports = { create }

function create () {
	return net.createServer(socket => {
		socket.addListener('data', data => authenticate(socket, data))
	})
}

function authenticate (socket, data) {
	const command = JSON.parse(data.toString())
	if (command.type != 'AUTHENTICATE') {
		return
	}
	verifyCredentials(command)
		.then(valid => valid ? addAgent(socket) : undefined)
		.catch(error => log.error(`authentication interrupted due to ${error.stack}`))
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