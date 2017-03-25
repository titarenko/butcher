const pg = require('../../pg')

module.exports = {
	repositories: () => pg('repositories').orderBy('updated_at', 'desc'),
	branches: () => pg('branches').orderBy('updated_at', 'desc'),
}