const pg = require('../pg')
const { NoRepositoryError } = require('./errors')

module.exports = { find, create }

function find (name) {
	return pg('repositories')
		.where({ name })
		.first()
		.then(it => {
			if (!it) {
				throw new NoRepositoryError(name)
			}
			return it
		})
}

function create ({ name, url, ssh }) {
	return pg('repositories').insert({ name, url, ssh })
}