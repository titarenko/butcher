const { WEB_APP_SECRET, PG } = process.env

if (!PG) {
	throw new Error('PG is missing')
}

if (!WEB_APP_SECRET) {
	throw new Error('WEB_APP_SECRET is missing')
}

module.exports = {
	pg: {
		connection: PG,
		client: 'pg',
	},
	webApp: { secret: WEB_APP_SECRET },
}