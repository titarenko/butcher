const pg = require('../../pg')
const { security, validation } = require('buhoi')

const validate = validation.create({
	name: validation.required(),
	secret: validation.required(),
	script: validation.required(),
})

module.exports = {
	list,
	view,
	create: security.bypass(validate, create),
	update: security.bypass(validate, update),
}

function list () {
	return pg('repositories')
}

function view (id) {
	return pg('repositories').where({ id }).first()
}

function create (params) {
	return pg('repositories')
		.insert({
			name: params.name,
			secret: params.secret,
			script: params.script,
			created_at: new Date(),
		})
		.return()
}

function update (params) {
	return pg('repositories')
		.where({ id: params.id })
		.update({
			name: params.name,
			secret: params.secret,
			script: params.script,
			updated_at: new Date(),
		})
		.return()
}