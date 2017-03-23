const execute = require('./execute')
const log = require('totlog')(__filename)
const { repository, branch } = require('./config')

module.exports = handle

function handle (data, send) {
	const commandText = data.toString()

	Promise
		.try(() => {
			const command = JSON.parse(commandText)
			if (repository && command.repository.name != repository
				|| branch && command.branch != branch) {
				throw new Error(`illegal command ${commandText}`)
			}
			return command
		})
		.then(command => execute({ command, onFeedback: data => handleFeedback(command, data) }))
		.catch(handleFailure)

	function handleFeedback (command, data) {
		send({ type: 'FEEDBACK', command, data })
	}

	function handleFailure (error) {
		log.error(`failed to execute ${commandText} due to ${error.stack}`)
		try {
			send({ type: 'FAILURE', command: JSON.parse(commandText) })
		} catch (sendError) {
			log.error(`failed to send failure due to ${sendError.stack}`)
		}
	}
}