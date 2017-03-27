const Promise = require('bluebird')
const os = require('os')

module.exports = { parse }

function parse () {
	return Promise.try(() => {
		const connection = process.argv[2] || process.env.BUTCHER
		if (!connection) {
			throw new Error('connection is missing, must be passed as first argument or BUTCHER environment variable')
		}

		const [ token, host, port ] = connection.split(/[@:]/)
		if (!token || !host || !port) {
			throw new Error('connection is malformed, must be token@host:port')
		}

		return { name: os.hostname(), token, host, port }
	})
}