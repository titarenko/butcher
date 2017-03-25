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
	const { type, name, role, repository, branch } = command
	if (type != 'AUTHENTICATE') {
		return
	}
	verifyCredentials(command)
		.then(valid => valid ? addAgent(socket, { name, role, repository, branch }) : undefined)
		.catch(error => log.error(`authentication interrupted due to ${error.stack}`))
}

function verifyCredentials ({ role, password, repository, branch }) {
	return pg('credentials')
		.where({ role, password })
		.where(function () {
			if (repository) {
				this.whereNull('repository').orWhere({ repository })
			} else {
				this.whereNull('repository')
			}
		})
		.where(function () {
			if (branch) {
				this.whereNull('branch').orWhere({ branch })
			} else {
				this.whereNull('branch')
			}
		})
		.first()
		.then(Boolean)
}

function addAgent (socket, props) {
	socket.removeListener('data', authenticate)

	socket.on('close', () => agents.remove(socket))
	socket.on('error', error => {
		log.error(`connection from ${socket.remoteAddress}:${socket.remotePort} failed due to ${error.stack}`)
		agents.remove(socket)
		socket.destroy()
	})

	agents.add(socket, props)
}