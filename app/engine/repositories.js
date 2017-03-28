const pg = require('../pg')
const { NoRepositoryError } = require('./errors')

module.exports = { find }

function find ({ repository: { name } }) {
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