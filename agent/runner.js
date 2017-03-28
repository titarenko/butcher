const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const writeFile = Promise.promisify(fs.writeFile, { context: fs })
const { execFile } = require('child_process')
const log = require('totlog')(__filename)

module.exports = { create }

function create ({ directory }) {
	return { run }

	function run ({ command, onStdout, onStderr, onExit, onError }) {
		log.debug('running command %j', command)

		const filename = `${command.repository.name}-${command.branch.name}.sh`
		const options = {
			cwd: directory,
			env: {
				'BUTCHER_REPOSITORY_NAME': command.repository.name,
				'BUTCHER_REPOSITORY_SSH': command.repository.ssh,
				'BUTCHER_BRANCH_NAME': command.branch.name,
				'BUTCHER_COMMIT_HASH': command.commit.hash,
				'BUTCHER_STAGE': command.stage,
			},
		}

		writeFile(path.join(directory, filename), command.branch.script, { mode: 0o700 })
			.then(() => exec({ filename, options, onStdout, onStderr }))
			.then(onExit)
			.catch(e => onError(e.stack))
	}
}

function exec ({ filename, options, onStdout, onStderr }) {
	return new Promise((resolve, reject) => {
		const child = execFile(filename, options)
		child.stderr.on('data', buffer => onStderr(buffer.toString()))
		child.stdout.on('data', buffer => onStdout(buffer.toString()))
		child.on('error', reject)
		child.on('close', resolve)
	})
}