const { security, validation } = require('buhoi')
const pg = require('../../pg')
const config = require('../../config')

const validate = validation.create({
	name: validation.required(),
	password: validation.required(),
})

module.exports = { login: security.bypass(validate, login) }

function login (params, req, res) {
	return pg('users')
		.where({ name: params.name })
		.first()
		.then(it => {
			if (!it || !security.verifyPassword(params.password, it.password_hash)) {
				throw new validation.ValidationError({ name: 'wrong name', password: 'or password' })
			}
			const user = { id: it.id, name: it.name, roles: it.roles }
			res.cookie('user', security.serialize(user, config.webApp.secret))
			return user
		})
}