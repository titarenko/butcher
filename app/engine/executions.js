const pg = require('../pg')
const agents = require('./agents')
const log = require('totlog')(__filename)

module.exports = { create }

function create (command) {
	return agents.find(command)
		.then(agent => createExecution(command, agent)
			.then(execution => Object.assign({ }, command, { execution: { id: execution.id } }))
			.then(command => runExecution(command, agent))
		)
		.catch(e => log.error('failed to start execution of %j due to %s', command, e.stack))
}

function createExecution (command, agent) {
	return pg('executions')
		.insert({
			event_id: command.event.id,
			branch_id: command.branch.id,
			agent_id: agent.id,
			command,
			started_at: new Date(),
		})
		.returning('*')
		.then(it => it[0])
}

function runExecution (command, agent) {
	return agent
		.execute({
			command,
			onStdout: content => appendOutput({ command, content, is_error: false }),
			onStderr: content => appendOutput({ command, content, is_error: true }),
			onExit: exit_code => finishExecution({ command, exit_code }),
		})
		.catch(error => abortExecution(command, error))
}

function appendOutput ({ command: { execution: { id } }, content, is_error }) {
	return Promise
		.all([
			pg('executions').where({ id }).update({ updated_at: new Date() }),
			pg('outputs').insert({ occurred_at: new Date(), execution_id: id, content, is_error }),
		])
		.catch(e => log.error(`failed to append "${content}" (error: ${is_error}) for ${id} due to ${e.stack}`))
}

function finishExecution ({ command: { execution: { id } }, exit_code }) {
	return pg('executions')
		.where({ id })
		.update({
			exit_code,
			finished_at: new Date(),
		})
		.catch(e => log.error(`failed to finish ${id} with ${exit_code} due to ${e.stack}`))
}

function abortExecution ({ execution: { id } }, error) {
	return pg('executions')
		.where({ id })
		.update({
			error: { stack: error.stack, message: error.toString() },
			aborted_at: new Date(),
		})
		.catch(e => log.error(`failed to abort ${id} with ${error.stack} due to ${e.stack}`))
}