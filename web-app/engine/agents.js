const Promise = require('bluebird')
const { NoObjectError } = require('./errors')

const agents = []

module.exports = { find, add, remove }

function find (command) {
	const agent = agents
		.filter(it => (!it.repository || it.repository == command.repository.name)
			&& (!it.branch || it.branch == command.branch)
		)[0]
	if (!agent) {
		throw new NoObjectError('agent', command)
	}
	return agent
}

function add (socket) {
	agents.push(createAgent(socket))
}

function remove (socket) {
	const index = agents.findIndex(it => it.socket == socket)
	if (index >= 0) {
		agents.splice(index, 1)
	}
}

function createAgent (socket) {
	return {
		execute: (command, onFeedback) => new Promise((resolve, reject) =>
			execute(socket, command, onFeedback, resolve, reject)
		),
	}
}

function execute (socket, command, onFeedback, resolve, reject) {
	socket.addListener('data', handleUpdate)
	socket.write(JSON.stringify({ type: 'EXECUTE', command }))
	function handleUpdate (data) {
		const { type, command: { execution }, data, error } = JSON.parse(data.toString())
		if (execution != command.execution) {
			return
		}
		if (type == 'FEEDBACK') {
			onFeedback(data)
		} else if (type == 'FINISH') {
			socket.removeListener('data', handleUpdate)
			resolve()
		} else if (type == 'ERROR') {
			socket.removeListener('data', handleUpdate)
			reject(new Error(error))
		}
	}
}