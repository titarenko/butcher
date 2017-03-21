const { NoObjectError } = require('./errors')

module.exports = { find, create }

function find (name) {
	return pg('repositories')
		.where({ name })
		.first()
		.then(it => {
			if (!it) {
				throw new NoObjectError('repository', name)
			}
			return it
		})
}

function create (repositoryName) {
	return pg('repositories').insert({
		name: repositoryName,
		created_at: new Date(),
	})
}