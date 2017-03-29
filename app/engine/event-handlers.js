const branches = require('./branches')
const executions = require('./executions')
const { NoBranchError } = require('./errors')
const log = require('totlog')(__filename)

module.exports = { handleGithubEvent }

function handleGithubEvent (ev) {
	const handler = findHandler(ev)
	if (handler) {
		handler(ev)
			.catch(error => log.error(`event ${ev.id} is not handled due to ${error.stack}`))
	} else {
		log.debug(`no handler for event ${ev.id}`)
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
	const convertedEvent = convertPushEvent(event)
	return getExtendedEvent(convertedEvent)
		.tap(it => executions.create(Object.assign({ stage: 'build' }, it)))
		.tap(it => executions.create(Object.assign({ stage: 'stage' }, it)))
		.catch(NoBranchError, () => branches.create(convertedEvent)
			.then(() => handlePush(event))
		)
}

function handleDelete (event) {
	const convertedEvent = convertPushEvent(event)
	return getExtendedEvent(convertedEvent)
		.tap(it => executions.create(Object.assign({ stage: 'remove' }, it)))
}

function getExtendedEvent (convertedEvent) {
	return branches.find(convertedEvent)
		.then(it => Object.assign(
			{ script: it.script },
			convertedEvent,
			{ branch: Object.assign({ id: it.id }, convertedEvent.branch) }
		))
}

function convertPushEvent (ev) {
	const body = ev.body
	const event = { id: ev.id }
	const repository = {
		name: body.repository.name,
		ssh: body.repository.ssh_url,
		url: body.repository.url,
	}
	const branch = { name: body.ref.slice(11) }
	const commit = { hash: body.after }
	return { event, repository, branch, commit }
}