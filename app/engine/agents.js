const Promise = require('bluebird')
const pg = require('../pg')
const log = require('totlog')(__filename)
const { NoAgentError } = require('./errors')

const agents = []

module.exports = { add, find }

function add ({ name, token, socket }) {
	return pg('agents')
		.where({ token })
		.first()
		.tap(it => {
			if (!it) {
				return
			}
			socket.on('close', () => remove(socket))
			socket.on('error', error => {
				log.error(`connection from ${socket.remoteAddress}:${socket.remotePort} failed due to ${error.stack}`)
				remove(socket)
				socket.destroy()
			})
			agents.push(createAgent(socket, {
				id: it.id,
				stage: it.stage,
				repository: it.repository,
				branch: it.branch,
			}))
		})
		.then(it => pg('agents')
			.where({ id: it.id })
			.update({
				ip: socket.remoteAddress,
				name,
				connected_at: new Date(),
				disconnected_at: null,
			})
		)
}

function remove (socket) {
	const index = agents.findIndex(it => it.socket == socket)
	if (index >= 0) {
		pg('agents')
			.where({ id: agents[index].id })
			.update({ disconnected_at: new Date() })
			.catch(e => log.error(`failed to update agent state due to ${e.stack}`))
		agents.splice(index, 1)
	}
}

function find (command) {
	return Promise.try(() => {
		const agent = agents
			.filter(it => (!it.repository || it.repository == command.repository.name)
				&& (!it.branch || it.branch == command.branch)
				&& (!it.stage || it.stage == command.stage)
			)[0]
		if (!agent) {
			throw new NoAgentError(command)
		}
		return agent
	})
}

function createAgent (socket, props) {
	return Object.assign({ socket }, props, {
		execute: (command, onFeedback) => new Promise((resolve, reject) =>
			execute(socket, command, onFeedback, resolve, reject)
		),
	})
}

function execute (socket, command, onFeedback, resolve, reject) {
	socket.addListener('data', handleUpdate)
	socket.write(JSON.stringify({ type: 'EXECUTE', command }))

	function handleUpdate (buffer) {
		const data = buffer.toString()
		log.debug('receiving feedback "%s" on execution %d', data, command.execution)
		const { type, text, code } = JSON.parse(data)

		if (type == 'FEEDBACK') {
			onFeedback(text)
		} else if (type == 'SUCCESS') {
			socket.removeListener('data', handleUpdate)
			resolve()
		} else if (type == 'FAILURE') {
			socket.removeListener('data', handleUpdate)
			reject(new Error(`Execution ${command.execution} failed with code ${code}.`))
		}
	}
}