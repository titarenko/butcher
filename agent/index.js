const net = require('net')
const execute = require('./execute')
const log = require('totlog')(__filename)
const { host, port, role, password, repository, branch } = require('./config')

const client = new net.Socket()

client.connect(port, host, () => {
	log.debug(`connected to ${host}:${port}`)
	send({ type: 'AUTHENTICATE', role, password, repository, branch })
})

client.on('data', data => {
	const command = JSON.parse(data.toString())
	if (repository && command.repository.name != repository
		|| branch && command.branch != branch) {
		log.error('illegal command %j', command)
		send({ type: 'ILLEGAL' })
		return
	}
	execute({ ...command, onFeedback: data => send({ type: 'FEEDBACK', command, data }) })
})

client.on('error', error => {
	log.error(`connection failed due to ${error.stack}`)
	process.kill(process.pid, 'SIGINT')
})

client.on('close', () => {
	process.kill(process.pid, 'SIGINT')
})

function send (message) {
	log.debug('sending %j', Object.assign({ }, message, { password: message.password ? '***' : undefined }))
	client.write(JSON.stringify(message))
}

process.on('SIGINT', () => {
	log.debug('shutting down')
	client.destroy()
})