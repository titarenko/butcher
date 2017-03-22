const net = require('net')
const execute = require('./execute')
const log = require('totlog')(__filename)
const { host, port, role, password, repository, branch } = require('./config')

const client = new net.Socket()

client.on('data', data => {
	const commandText = data.toString()

	Promise
		.try(() => {
			const command = JSON.parse(commandText)
			if (repository && command.repository.name != repository
				|| branch && command.branch != branch) {
				throw new Error(`illegal command ${commandText}`)
			}
			return command
		})
		.then(command => execute({ command, onFeedback: data => handleFeedback(command, data) }))
		.catch(handleFailure)

	function handleFeedback (command, data) {
		send({ type: 'FEEDBACK', command, data })
	}

	function handleFailure (error) {
		log.error(`failed to execute ${commandText} due to ${error.stack}`)
		try {
			send({ type: 'FAILURE', command: JSON.parse(commandText) })
		} catch (sendError) {
			log.error(`failed to send failure due to ${sendError.stack}`)
		}
	}
})

client.connect(port, host, () => {
	log.debug(`connected to ${host}:${port}`)
	send({ type: 'AUTHENTICATE', role, password, repository, branch })
})

function send (message) {
	log.debug('sending %j', Object.assign({ }, message, { password: message.password ? '***' : undefined }))
	client.write(JSON.stringify(message))
}

process.on('SIGINT', shutdown)
client.on('close', shutdown)
client.on('error', error => {
	log.error(`connection failed due to ${error.stack}`)
	shutdown()
})

function shutdown () {
	log.debug('shutting down')
	if (!client.destroyed) {
		client.destroy()
	}
}