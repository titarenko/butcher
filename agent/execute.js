const fs = require('fs')
const { spawn } = require('child_process')
const Promise = require('bluebird')
const log = require('totlog')(__filename)

const readFile = Promise.promisify(fs.readFile, { context: fs })

module.exports = execute

function execute ({ command, onFeedback }) {
	const location = `/var/lib/butcher/${command.repository.name}`
	return cloneFinallyFetch(command.repository.ssh, location, onFeedback)
		.then(() => copyCheckoutFinallyPull(location, command.branch, onFeedback))
		.then(() => readExecute(location, command, onFeedback))
		.then(() => command.stage == 'clear' ? remove(location, command.branch, onFeedback) : undefined)
		.return(command)
}

function cloneFinallyFetch (url, location, onFeedback) {
	const masterLocation = `${location}/master`
	return run(onFeedback, undefined, 'mkdir', '-p', masterLocation)
		.then(() => run(onFeedback, masterLocation, 'git', 'clone', url, '.'))
		.catch(() => undefined)
		.finally(() => run(onFeedback, masterLocation, 'git', 'fetch'))
}

function copyCheckoutFinallyPull (location, branch, onFeedback) {
	const masterLocation = `${location}/master`
	const branchLocation = `${location}/${branch}`
	return run(onFeedback, undefined, 'mkdir', '-p', branchLocation)
		.then(() => run(onFeedback, undefined, 'cp', '-r', masterLocation, branchLocation))
		.then(() => run(onFeedback, branchLocation, 'git', 'checkout', branch))
		.catch(() => undefined)
		.finally(() => run(onFeedback, branchLocation, 'git', 'pull'))
}

function readExecute (location, { branch, stage }, onFeedback) {
	const branchLocation = `${location}/${branch}`
	return readFile(`${branchLocation}/.butcher.json`, 'utf-8')
		.then(JSON.parse)
		.then(config => config[stage])
		.then(command => command ? run(onFeedback, branchLocation, ...command) : undefined)
}

function remove (location, branch, onFeedback) {
	return run(onFeedback, undefined, 'rm', '-rf', `${location}/${branch}`)
}

function run (onFeedback, cwd, ...args) {
	return new Promise((resolve, reject) => {
		log.debug(`running ${args.join(' ')} in ${cwd || 'current directory'}`)
		const child = spawn(args[0], args.slice(1), { cwd })
		let error = ''
		if (onFeedback) {
			child.stdout.on('data', onFeedback)
			child.stderr.on('data', onFeedback)
		}
		child.stderr.on('data', data => error += data.toString())
		child.on('error', reject)
		child.on('close', code => {
			if (code == 0) {
				resolve()
			} else {
				reject(new Error(`command ${args.join(' ')} exited with code ${code}: "${error}"`))
			}
		})
	})
}