const repositories = require('./repositories')
const { NoObjectError } = require('./errors')

module.exports = { find, create }

function find (repositoryName, branchName) {
	return pg('branches')
		.where({
			repository_id: pg('repositories')
				.select('id')
				.where({ name: repositoryName }),
			name: branchName,
		})
		.first()
		.then(it => {
			if (!it) {
				throw new NoObjectError('branch', branchName)
			}
			return it
		})
}

function create (repositoryName, branchName) {
	return repositories.find(repositoryName)
		.then(it => pg('branches')
			.insert({
				repository_id: it.id,
				name: branchName,
				created_at: new Date(),
			})
		)
		.catch(NoObjectError, () => repositories.create(repositoryName)
			.then(() => create(repositoryName, branchName))
		)
}
