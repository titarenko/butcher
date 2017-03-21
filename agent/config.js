const connectionString = process.env.BUTCHER_CONNECTION

if (!connectionString) {
	throw new Error('BUTCHER_CONNECTION is not specified')
}

const [role, password, host, port, repository, branch] = connectionString.split(/[@/:]/)

if (!role) {
	throw new Error('BUTCHER_CONNECTION does not contain role')
}

if (!password) {
	throw new Error('BUTCHER_CONNECTION does not contain password')
}

if (!host) {
	throw new Error('BUTCHER_CONNECTION does not contain host')
}

if (!port) {
	throw new Error('BUTCHER_CONNECTION does not contain port')
}

module.exports = {
	role,
	password,
	host,
	port,
	repository,
	branch,
}