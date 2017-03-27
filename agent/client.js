const net = require('net')
const log = require('totlog')(__filename)

module.exports = { create }

function create ({ onConnection, onCommand, onError }) {
	const client = new net.Socket()

	client.on('connect', () => {
		log.debug(`connected to ${client.remoteAddress}:${client.remotePort}`)
		onConnection()
	})

	client.on('data', data => {
		const text = data.toString()
		log.debug(`received command ${text}`)
		onCommand(JSON.parse(text))
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
			const text = JSON.stringify(command)
			log.debug(`sending command ${text}`)
			client.write(text)
		},
		isDestroyed: () => client.destroyed,
		destroy: () => client.destroy(),
	}
}