const pg = require('../../pg')
const agents = require('../../engine/agents')

module.exports = {
	agents: () => agents.list(),
	repositories: () => pg('repositories').orderBy('updated_at', 'desc'),
	branches: () => pg('branches').orderBy('updated_at', 'desc'),

}