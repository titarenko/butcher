const branches = require('./branches')
const executions = require('./executions')
const { NoBranchError } = require('./errors')
const log = require('totlog')(__filename)

module.exports = { handleGithubEvent }

function handleGithubEvent (ev) {
	const handler = findHandler(ev)
	if (handler) {
		handler(ev)
			.catch(error => log.error('event %d is not handled due to %s', ev.id, error.stack))
	} else {
		log.debug('event %j is skipped since there is no handler for it', ev)
	}
}

function findHandler (ev) {
	if (!ev.body.ref) {
		return
	}
	return ev.body.after == '0000000000000000000000000000000000000000'
		? handleDelete
		: handlePush
}

function handlePush (event) {
	const { repository, branch, commit } = convertPushEvent(event)
	return branches.find(repository.name, branch)
		.tap(it => executions.create({
			event,
			branch: it,
			command: {
				repository,
				branch,
				commit,
				stage: 'build',
				script: 'echo build',
			},
		}))
		.tap(it => executions.create({
			event,
			branch: it,
			command: {
				repository,
				branch,
				commit,
				stage: 'stage',
				script: 'echo stage',
			},
		}))
		.catch(NoBranchError, () => branches.create(repository, branch)
			.then(() => handlePush(event))
		)
}

function handleDelete (event) {
	const { repository, branch } = convertPushEvent(event)
	return branches.find(repository.name, branch)
		.tap(it => executions.create({
			event,
			branch: it,
			command: {
				repository,
				branch,
				stage: 'remove',
				script: 'echo remove',
			},
		}))
}

function convertPushEvent (ev) {
	const body = ev.body
	const repository = {
		name: body.repository.name,
		ssh: body.repository.ssh_url,
		url: body.repository.url,
	}
	const branch = body.ref.slice(11)
	const commit = body.after
	return { repository, branch, commit }
}