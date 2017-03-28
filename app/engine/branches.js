const pg = require('../pg')
const repositories = require('./repositories')
const { NoBranchError } = require('./errors')

module.exports = { find, create }

function find ({ repository, branch }) {
	return pg('branches as b')
		.join('repositories as r', 'r.id', 'b.repository_id')
		.where({
			'r.name': repository.name,
			'b.name': branch.name,
		})
		.select('b.*', 'r.script')
		.first()
		.then(it => {
			if (!it) {
				throw new NoBranchError(repository.name, branch.name)
			}
			return it
		})
}

function create ({ repository, branch }) {
	return repositories.find({ repository })
		.then(it => pg('branches')
			.insert({
				repository_id: it.id,
				name: branch.name,
				created_at: new Date(),
			})
		)
}