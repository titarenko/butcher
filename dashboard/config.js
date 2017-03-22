const secret = process.env.BUTCHER_SECRET
if (!secret) {
	throw new Error('BUTCHER_SECRET is missing'))
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
	github: { secret },
}