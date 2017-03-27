const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const writeFile = Promise.promisify(fs.writeFile, { context: fs })
const { execFile } = require('child_process')
const log = require('totlog')(__filename)

module.exports = { create }

function create ({ directory }) {
	return { run }
	function run ({ command, onText, onSuccess, onFailure }) {
		log.debug('running command %j', command)
		const filename = `${command.repository.name}-${command.branch}.sh`

		log.debug('running %s built upon %j in %s', filename, command, directory)

		const options = {
			cwd: directory,
			env: {
				'BUTCHER_REPOSITORY': command.repository.name,
				'BUTCHER_REPOSITORY_SSH': command.repository.ssh,
				'BUTCHER_BRANCH': command.branch,
				'BUTCHER_COMMIT': command.commit,
			},
		}

		writeFile(path.join(directory, filename), command.script, { mode: 0o700 })
			.then(() => exec({
				filename,
				args: [command.stage],
				options,
				onData: data => onText(data.toString()),
			}))
			.then(() => onSuccess())
			.catch(e => {
				log.warn('execution %d failed due to %e', command.execution, e)
				onFailure(e.exitCode || 'no exit code')
			})
	}
}

function exec ({ filename, args, options, onData }) {
	return new Promise((resolve, reject) => {
		const child = execFile(filename, args, options)
		child.stderr.on('data', onData)
		child.stdout.on('data', onData)
		child.on('error', reject)
		child.on('close', exitCode => exitCode ? reject({ exitCode }) : resolve())
	})
}