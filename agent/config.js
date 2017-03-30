const Promise = require('bluebird')
const os = require('os')

module.exports = { parse }

function parse () {
	return Promise.try(() => {
		const connection = process.env.BUTCHER_CONNECTION
		if (!connection) {
			throw new Error('BUTCHER_CONNECTION must be specified')
		}

		const home = process.env.BUTCHER_HOME
		if (!home) {
			throw new Error('BUTCHER_HOME must be specified')
		}

		const [ token, host, port ] = connection.split(/[@:]/)
		if (!token || !host || !port) {
			throw new Error('connection is malformed, must be token@host:port')
		}

		return {
			name: os.hostname(),
			token,
			host,
			port,
			home,
		}
	})
}