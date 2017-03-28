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
		const id = agents[index].id
		pg('agents')
			.where({ id })
			.update({ disconnected_at: new Date() })
			.catch(e => log.error(`failed to update agent ${id} state due to ${e.stack}`))
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
	return Object.assign({ socket }, props, { execute })
	function execute (params) {
		return new Promise((resolve, reject) => executeOnAgent(socket, params, resolve, reject))
	}
}

function executeOnAgent (socket, { command, onStdout, onStderr, onExit }, resolve, reject) {
	socket.addListener('error', finalize)
	socket.addListener('close', () => finalize(new Error('agent socket unexpectedly closed')))
	socket.addListener('data', handleUpdate)

	socket.write(JSON.stringify({ type: 'EXECUTE', command }))

	let finalized = false

	function finalize (error) {
		if (finalized) {
			return
		}

		socket.removeListener('close', finalize)
		socket.removeListener('error', finalize)
		socket.removeListener('data', handleUpdate)

		finalized = true

		if (error) {
			reject(error)
		} else {
			resolve()
		}
	}

	function handleUpdate (buffer) {
		const data = buffer.toString()
		log.debug('receiving feedback "%s" on execution %d', data, command.execution.id)

		const { type, content } = JSON.parse(data)
		switch (type) {
			case 'STDOUT':
				onStdout(content)
				break
			case 'STDERR':
				onStderr(content)
				break
			case 'EXIT':
				onExit(content)
				finalize()
				break
			case 'ERROR':
				finalize(new Error(content))
				break
		}
	}
}