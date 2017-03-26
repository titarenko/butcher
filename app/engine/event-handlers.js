const branches = require('./branches')
const executions = require('./executions')
const { NoBranchError } = require('./errors')
const log = require('totlog')(__filename)

module.exports = { handleGithubEvent }

function handleGithubEvent (ev) {
	const handler = findHandler(ev.body)
	if (handler) {
		handler(ev.body).catch(error => log.error('event %j not handled due to %s', ev, error.stack))
	} else {
		log.debug('event %j skipped since there is no handler for it', ev)
	}
}

function findHandler (ev) {
	if (!ev.ref) {
		return
	}
	return ev.after == '0000000000000000000000000000000000000000' ? handleDelete : handlePush
}

function handlePush (ev) {
	const { repository, branch, commit } = convertPushEvent(ev)
	return branches.find(repository.name, branch)
		.tap(it => executions.create(it, {
			repository,
			branch,
			commit,
			stage: 'build',
		}))
		.tap(it => executions.create(it, {
			repository,
			branch,
			commit,
			stage: 'stage',
		}))
		.catch(NoBranchError, () => branches.create(repository, branch)
			.then(() => handlePush(ev))
		)
}

function handleDelete (ev) {
	const { repository, branch } = convertPushEvent(ev)
	return branches.find(repository.name, branch)
		.tap(it => executions.create(it, {
			repository,
			branch,
			stage: 'remove',
		}))
}

function convertPushEvent (ev) {
	const repository = {
		name: ev.repository.name,
		ssh: ev.repository.ssh_url,
		url: ev.repository.url,
	}
	const branch = ev.ref.slice(11)
	const commit = ev.after
	return { repository, branch, commit }
}