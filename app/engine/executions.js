const pg = require('../pg')
const agents = require('./agents')
const log = require('totlog')(__filename)

module.exports = { create }

function create (eventObject, branchObject, command) {
	return createExecution(eventObject, branchObject, command).then(executionObject => {
		return agents
			.find(command)
			.execute(
				Object.assign({ }, command, { execution: executionObject.id }),
				text => updateExecution(executionObject, text)
			)
			.then(() => finalizeExecution(executionObject))
			.catch(error => finalizeExecution(executionObject, error))
	})
}

function createExecution (eventObject, branchObject, command) {
	return pg('executions')
		.insert({
			event_id: eventObject.id,
			branch_id: branchObject.id,
			command,
		})
		.returning('*')
		.then(it => it[0])
}

function updateExecution (executionObject, text) {
	return pg('executions')
		.where({ id: executionObject.id })
		.update({
			feedback: pg.raw("coalesce(feedback, '') || ?", [text]),
			updated_at: new Date(),
		})
		.catch(e => log.error(`failed to update execution ${executionObject.id} with ${text} due to ${e.stack}`))
}

function finalizeExecution (executionObject, error) {
	if (error) {
		log.warn(`execution ${executionObject.id} failed due to ${error.stack}`)
	}
	return pg('executions')
		.where({ id: executionObject.id })
		.update({
			finished_at: new Date(),
			is_failed: error != null,
		})
}