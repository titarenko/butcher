const pg = require('../../pg')
const { filter } = require('knex-filter')

module.exports = {
	agents: () => pg('agents').orderBy('connected_at', 'desc'),
	repositories: () => pg('repositories').orderBy('updated_at', 'desc'),
	branches: params => pg.from(pg('branches as b')
		.select('b.*', 'r.name as repository')
		.join('repositories as r', 'r.id', 'b.repository_id').as('t'))
		.where(filter(params))
		.orderBy('updated_at', 'desc'),
	executions: params => pg.from(pg('executions as e')
		.select(
			'e.*',
			'e.created_at as started_at',
			'r.name as repository',
			'b.name as branch',
			pg.raw("command->>'commit' as commit"),
			pg.raw('coalesce(a.name, a.ip) as agent'),
			pg.raw("command->>'stage' as stage")
		)
		.join('branches as b', 'b.id', 'e.branch_id')
		.join('repositories as r', 'r.id', 'b.repository_id')
		.join('agents as a', 'a.id', 'e.agent_id').as('t'))
		.where(filter(params))
		.orderBy('updated_at', 'desc')
		.limit(21),
}