const gitHubSecret = process.env.BUTCHER_GITHUB_SECRET
if (!gitHubSecret) {
	throw new Error('BUTCHER_GITHUB_SECRET is missing')
}

const webAppSecret = process.env.BUTCHER_WEB_APP_SECRET
if (!webAppSecret) {
	throw new Error('BUTCHER_WEB_APP_SECRET is missing')
}

const connection = process.env.BUTCHER_PG
if (!connection) {
	throw new Error('BUTCHER_PG is missing')
}

module.exports = {
	pg: {
		connection,
		client: 'pg',
	},
	gitHub: { secret: gitHubSecret },
	webApp: { secret: webAppSecret },
}