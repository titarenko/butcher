const pg = require('../../pg')
const { filter } = require('knex-filter')

module.exports = {
	agents: params => pg('agents')
		.where(function () {
			this.whereNull('repository')
				.orWhere('repository', params.repository || pg.raw('repository'))
		})
		.where(function () {
			this.whereNull('branch')
				.orWhere('branch', params.branch || pg.raw('branch'))
		})
		.orderBy('connected_at', 'desc'),
	repositories: () => pg('repositories').orderBy('updated_at', 'desc'),
	branches: params => pg.from(pg('branches as b')
		.select('b.*', 'r.name as repository')
		.join('repositories as r', 'r.id', 'b.repository_id').as('t'))
		.where(filter(params))
		.orderBy('updated_at', 'desc'),
	executions: params => pg.from(pg('executions as e')
		.select(
			'e.*',
			'r.name as repository',
			'b.name as branch',
			pg.raw("command#>>'{commit,hash}' as commit"),
			pg.raw('coalesce(a.name, a.ip) as agent'),
			pg.raw("command->>'stage' as stage"),
			pg.select(pg.raw("string_agg(content, '\n' order by occurred_at)"))
				.from('outputs as o')
				.whereRaw('o.execution_id = e.id')
				.as('feedback'),
			pg.raw("e.error->>'message' as error")
		)
		.join('branches as b', 'b.id', 'e.branch_id')
		.join('repositories as r', 'r.id', 'b.repository_id')
		.join('agents as a', 'a.id', 'e.agent_id').as('t'))
		.where(filter(params))
		.orderByRaw('started_at desc nulls last')
		.limit(21),
}