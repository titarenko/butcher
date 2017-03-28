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
	webApp: { secret: webAppSecret },
}