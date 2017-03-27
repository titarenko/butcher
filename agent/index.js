const Promise = require('bluebird')

const config = require('./config')
const client = require('./client')
const runner = require('./runner')

const log = require('totlog')(__filename)

Promise.longStackTraces()

config.parse().then(start).catch(log.error)

function start ({ name, token, host, port }) {
	const runnerInstance = runner.create({ directory: '/var/lib/butcher' })
	const clientInstance = client.create({
		onConnection: () => clientInstance.send({ type: 'AUTH', name, token }),
		onCommand: command => runnerInstance.run({
			command: command.command,
			onText: text => clientInstance.send({ type: 'FEEDBACK', id: command.id, text }),
			onSuccess: () => clientInstance.send({ type: 'SUCCESS', id: command.id }),
			onFailure: code => clientInstance.send({ type: 'FAILURE', id: command.id, code }),
		}),
		onError: () => process.nextTick(() => process.kill(process.pid, 'SIGINT')),
	})
	process.on('SIGINT', () => clientInstance.destroy())
	clientInstance.connect({ host, port })
}