const Promise = require('bluebird')
const net = require('net')
const handle = require('./handle')
const log = require('totlog')(__filename)
const { host, port, role, password, repository, branch } = require('./config')

Promise.longStackTraces()

const client = new net.Socket()

client.on('data', data => handle(data, send))
client.on('close', shutdown)
client.on('error', error => {
	log.error(`connection failed due to ${error.stack}`)
	shutdown()
})

client.connect(port, host, () => {
	log.debug(`connected to ${host}:${port}`)
	send({
		type: 'AUTHENTICATE',
		role,
		password,
		repository,
		branch,
	})
})

function send (message) {
	log.debug('sending %j', Object.assign({ }, message, { password: message.password ? '***' : undefined }))
	client.write(JSON.stringify(message))
}

process.on('SIGINT', shutdown)

function shutdown () {
	if (!client.destroyed) {
		log.debug('shutting down')
		client.destroy()
	}
}