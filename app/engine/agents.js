const Promise = require('bluebird')
const { NoAgentError } = require('./errors')
const _ = require('lodash')
const log = require('totlog')(__filename)

const agents = []

module.exports = { list, find, add, remove }

function list () {
	return agents.map(it => _.pick(it, ['ip', 'name', 'role', 'repository', 'branch']))
}

function find (command) {
	const agent = agents
		.filter(it => (!it.repository || it.repository == command.repository.name)
			&& (!it.branch || it.branch == command.branch)
		)[0]
	if (!agent) {
		throw new NoAgentError(command)
	}
	return agent
}

function add (socket, props) {
	agents.push(createAgent(socket, props))
}

function remove (socket) {
	const index = agents.findIndex(it => it.socket == socket)
	if (index >= 0) {
		agents.splice(index, 1)
	}
}

function createAgent (socket, props) {
	return Object.assign({ socket, ip: socket.remoteAddress }, props, {
		execute: (command, onFeedback) => new Promise((resolve, reject) =>
			execute(socket, command, onFeedback, resolve, reject)
		),
	})
}

function execute (socket, command, onFeedback, resolve, reject) {
	socket.addListener('data', handleUpdate)
	socket.write(JSON.stringify({ type: 'EXECUTE', command }))
	function handleUpdate (buffer) {
		log.debug('got feedback %s on %j', buffer.toString(), command)
		const { type, command: { execution }, data, error } = JSON.parse(buffer.toString())
		if (execution != command.execution) {
			return
		}
		if (type == 'FEEDBACK') {
			onFeedback(data)
		} else if (type == 'SUCCESS') {
			socket.removeListener('data', handleUpdate)
			resolve()
		} else if (type == 'FAILURE') {
			socket.removeListener('data', handleUpdate)
			reject(new Error(error))
		}
	}
}