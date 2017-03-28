const pg = require('../../pg')
const { security, validation } = require('buhoi')

const validate = validation.create({ token: validation.required() })

module.exports = {
	list,
	view,
	create: security.bypass(validate, create),
	update: security.bypass(validate, update),
}

function list () {
	return pg('agents')
}

function view (id) {
	return pg('agents').where({ id }).first()
}

function create (params) {
	return pg('agents')
		.insert({
			name: params.name,
			token: params.token,
			stage: params.stage,
			repository: params.repository,
			branch: params.branch,
			created_at: new Date(),
		})
		.return()
}

function update (params) {
	return pg('agents')
		.where({ id: params.id })
		.update({
			name: params.name,
			token: params.token,
			stage: params.stage,
			repository: params.repository,
			branch: params.branch,
			updated_at: new Date(),
		})
		.return()
}