const { security } = require('buhoi')
const pg = require('../pg')
const { roles } = require('../enums')
const log = require('totlog')(__filename)

const { ADMIN_NAME, ADMIN_PWD } = process.env

if (!ADMIN_NAME || !ADMIN_PWD) {
	log.error('ADMIN_NAME and ADMIN_PWD must be specified')
	process.exit(1)
}

pg('users')
	.insert({
		name: ADMIN_NAME,
		password_hash: security.hashPassword(ADMIN_PWD),
		roles: [roles.admin],
	})
	.then(() => process.exit(0))
	.catch(e => {
		log.error(`failed to add admin user due to ${e.stack}`)
		process.exit(1)
	})