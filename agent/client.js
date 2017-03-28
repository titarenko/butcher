const net = require('net')
const log = require('totlog')(__filename)

module.exports = { create }

function create ({ onConnection, onCommand, onError }) {
	const client = new net.Socket()

	client.on('connect', () => {
		log.debug(`connected to ${client.remoteAddress}:${client.remotePort}`)
		onConnection()
	})

	client.on('data', buffer => {
		const content = buffer.toString()
		log.debug(`received command ${content}`)
		onCommand(JSON.parse(content))
	})

	client.on('error', error => {
		log.debug(error.stack)
		onError(error)
	})

	return {
		connect: ({ host, port }) => {
			log.debug(`connecting to ${host}:${port}`)
			client.connect(port, host)
		},
		send: command => {
			const content = JSON.stringify(command)
			log.debug(`sending command ${content}`)
			client.write(content)
		},
		isDestroyed: () => client.destroyed,
		destroy: () => client.destroy(),
	}
}