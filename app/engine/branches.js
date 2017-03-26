const pg = require('../pg')
const repositories = require('./repositories')
const { NoRepositoryError, NoBranchError } = require('./errors')

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
				throw new NoBranchError(branchName)
			}
			return it
		})
}

function create (repository, branchName) {
	return repositories.find(repository.name)
		.then(it => pg('branches')
			.insert({
				repository_id: it.id,
				name: branchName,
				created_at: new Date(),
			})
		)
		.catch(NoRepositoryError, () => repositories.create(repository)
			.then(() => create(repository, branchName))
		)
}