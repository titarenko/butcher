const Promise = require('bluebird')

const config = require('./config')
const client = require('./client')
const runner = require('./runner')

const log = require('totlog')(__filename)

Promise.longStackTraces()

config.parse().then(start).catch(log.error)

function start ({ name, token, host, port }) {
	const runa = runner.create({ directory: '/var/lib/butcher' })
	const cli = client.create({
		onConnection: () => cli.send({ type: 'AUTH', name, token }),
		onCommand: command => runa.run({
			command,
			onStdout: content => cli.send({ type: 'STDOUT', content }),
			onStderr: content => cli.send({ type: 'STDERR', content }),
			onExit: content => cli.send({ type: 'EXIT', content }),
			onError: content => cli.send({ type: 'ERROR', content }),
		}),
		onError: () => process.nextTick(() => process.kill(process.pid, 'SIGINT')),
	})
	process.on('SIGINT', () => cli.destroy())
	cli.connect({ host, port })
}