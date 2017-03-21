const bus = require('../web-app/bus')
const log = require('totlog')(__filename)

const executions = require('./executions')

bus.on('github event', ev => {
	const handler = findHandler(ev)
	if (handler) {
		handler(ev).catch(error => log.error('event %j not handled due to %s', ev, error.stack))
	} else {
		log.debug('event %j skipped since there is no handler for it', ev)
	}
})

function findHandler (ev) {
	if (ev.ref) {
		return ev.after == '0000000000000000000000000000000000000000'
			? handleDelete
			: handlePush
	}
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
		.catch(NoObjectError, () => branches.create(repository.name, branch)
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
		url: ev.repository.ssh_url,
	}
	const branch = ev.ref.slice(11)
	const commit = ev.after
	return { repository, branch, commit }
}