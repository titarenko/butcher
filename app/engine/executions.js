const pg = require('../pg')
const agents = require('./agents')
const log = require('totlog')(__filename)

module.exports = { create }

function create (params) {
	const { event, branch, command } = params
	return agents.find(command)
		.then(agent => createExecution({ agent, event, branch, command })
			.then(execution => runExecution({ execution, agent, command }))
		)
		.catch(e => log.error('failed to start execution of %j due to %s', command, e.stack))
}

function createExecution ({ event, branch, agent, command }) {
	return pg('executions')
		.insert({
			event_id: event.id,
			branch_id: branch.id,
			agent_id: agent.id,
			command,
		})
		.returning('*')
		.then(it => it[0])
}

function runExecution ({ execution, agent, command }) {
	const params = Object.assign({ }, command, { execution: execution.id })
	return agent.execute(params, text => updateExecution(execution.id, text))
		.then(() => finalizeExecution(execution.id))
		.catch(error => finalizeExecution(execution.id, error))
}

function updateExecution (id, text) {
	return pg('executions')
		.where({ id })
		.update({
			feedback: pg.raw("coalesce(feedback, '') || ?", [text]),
			updated_at: new Date(),
		})
		.catch(e => log.error(`failed to update execution ${id} with ${text} due to ${e.stack}`))
}

function finalizeExecution (id, error) {
	if (error) {
		log.warn(`execution ${id} failed due to ${error.stack}`)
	}
	return pg('executions')
		.where({ id })
		.update({
			finished_at: new Date(),
			is_failed: error != null,
		})
}