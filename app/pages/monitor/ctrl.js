const pg = require('../../pg')

module.exports = {
	agents: () => pg('agents').orderBy('connected_at', 'desc'),
	repositories: () => pg('repositories').orderBy('updated_at', 'desc'),
	branches: () => pg('branches as b')
		.select('b.*', 'r.name as repository')
		.join('repositories as r', 'r.id', 'b.repository_id')
		.orderBy('b.updated_at', 'desc'),
	executions: () => pg('executions as e')
		.select(
			'e.*',
			'e.created_at as started_at',
			'r.name as repository',
			'b.name as branch',
			pg.raw("command->>'commit' as commit")
		)
		.join('branches as b', 'b.id', 'e.branch_id')
		.join('repositories as r', 'r.id', 'b.repository_id')
		.orderBy('e.updated_at', 'desc')
		.limit(20),
}