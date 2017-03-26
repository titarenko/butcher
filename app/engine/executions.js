const pg = require('../pg')
const agents = require('./agents')
const log = require('totlog')(__filename)

module.exports = { create }

function create (branchObject, command) {
	return createExecution(branchObject, command)
		.tap(it => agents.find(command).execute(
			Object.assign({ }, command, { execution: it.id }),
			data => updateExecution(it, data)
		))
		.tap(it => finalizeExecution(it))
}

function createExecution (branchObject, command) {
	return pg('executions')
		.insert({
			branch_id: branchObject.id,
			command,
		})
		.returning('*')
		.then(it => it[0])
}

function updateExecution (executionObject, data) {
	return pg('executions')
		.where({ id: executionObject.id })
		.update({
			feedback: pg.raw("coalesce(feedback, '') || ?", [data.toString()]),
			updated_at: new Date(),
		})
		.catch(e => log.error(`failed to update execution ${executionObject.id} with ${data} due to ${e.stack}`))
}

function finalizeExecution (executionObject) {
	return pg('executions')
		.where({ id: executionObject.id })
		.update({ finished_at: new Date() })
}