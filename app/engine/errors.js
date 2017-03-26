const util = require('util')

module.exports = {
	NoRepositoryError,
	NoBranchError,
	NoAgentError,
}

function NoRepositoryError () {
	Error.call(this)
	Error.captureStackTrace(this, NoRepositoryError)
}

util.inherits(NoRepositoryError, Error)

function NoBranchError () {
	Error.call(this)
	Error.captureStackTrace(this, NoBranchError)
}

util.inherits(NoBranchError, Error)

function NoAgentError () {
	Error.call(this)
	Error.captureStackTrace(this, NoAgentError)
}

util.inherits(NoAgentError, Error)