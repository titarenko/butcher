const util = require('util')

module.exports = {
	NoRepositoryError,
	NoBranchError,
	NoAgentError,
}

function NoRepositoryError (name) {
	Error.call(this)
	Error.captureStackTrace(this, NoRepositoryError)
	this.message = `repository "${name}" not found`
}

util.inherits(NoRepositoryError, Error)

function NoBranchError (repositoryName, branchName) {
	Error.call(this)
	Error.captureStackTrace(this, NoBranchError)
	this.message = `branch "${branchName}" of repository "${repositoryName}" not found`
}

util.inherits(NoBranchError, Error)

function NoAgentError (stage, branchName, repositoryName) {
	Error.call(this)
	Error.captureStackTrace(this, NoAgentError)
	this.message = `agent for "${stage}" (branch "${branchName}" of repository "${repositoryName}") not found`
}

util.inherits(NoAgentError, Error)