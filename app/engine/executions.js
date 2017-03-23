const pg = require('../pg')
const agents = require('./agents')

module.exports = { create }

function create (branchObject, command) {
	return createExecution(branchObject, command)
		.tap(it => agents.find(command).execute(
			{ ...command, execution: it.id },
			data => updateExecution(it, data)
		))
		.tap(it => finalizeExecution(it))
}

function createExecution (branchObject, command) {
	return pg('executions')
		.insert({
			branch_id: branchObject.id,
			command,
			created_at: new Date(),
		})
		.returning('*')
		.then(it => it[0])
}

function updateExecution (executionObject, data) {
	return pg('executions')
		.where({ id: executionObject.id })
		.update({
			feedback: pg.raw('feedback || ?', [data]),
			updated_at: new Date(),
		})
}

function finalizeExecution (executionObject) {
	return pg('executions')
		.where({ id: executionObject.id })
		.udpate({ finished_at: new Date() })
}