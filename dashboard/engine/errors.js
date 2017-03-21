const util = require('util')

module.exports = { NoObjectError }

function NoObjectError(entity, name) {
	Error.call(this)
	Error.captureStackTrace(this, NoObjectError)
	this.entity = entity
	this.name = name
}

util.inherits(NoObjectError, Error)