const fs = require('fs')
const { spawn } = require('child_process')
const Promise = require('bluebird')
const log = require('totlog')(__filename)

const readFile = Promise.promisify(fs.readFile, { context: fs })

module.exports = execute

function execute ({ command, onFeedback }) {
	const location = `/var/lib/butcher/${command.repository.name}`
	return cloneFinallyFetch(command.repository.ssh, location)
		.then(() => copyCheckoutFinallyPull(location, command.branch))
		.then(() => readExecute(location, command, onFeedback))
		.then(() => command.stage == 'clear' ? remove(location, command.branch) : undefined)
		.return(command)
}

function cloneFinallyFetch (url, location) {
	const masterLocation = `${location}/master`
	return run(undefined, 'mkdir', '-p', masterLocation)
		.then(() => run(masterLocation, 'git', 'clone', url, '.'))
		.catch(() => undefined)
		.finally(() => run(masterLocation, 'git', 'fetch'))
}

function copyCheckoutFinallyPull (location, branch) {
	const masterLocation = `${location}/master`
	const branchLocation = `${location}/${branch}`
	return run(undefined, 'mkdir', '-p', branchLocation)
		.then(() => run(undefined, 'cp', '-r', masterLocation, branchLocation))
		.then(() => run(branchLocation, 'git', 'checkout', branch))
		.catch(() => undefined)
		.finally(() => run(branchLocation, 'git', 'pull'))
}

function readExecute (location, { branch, stage }, onFeedback) {
	const branchLocation = `${location}/${branch}`
	return readFile(`${branchLocation}/.butcher.json`, 'utf-8')
		.then(JSON.parse)
		.then(config => config[stage])
		.then(command => runWithFeedback(onFeedback, branchLocation, ...command))
}

function remove (location, branch) {
	return run(undefined, 'rm', '-rf', `${location}/${branch}`)
}

function run (cwd, ...args) {
	return runWithFeedback(undefined, cwd, ...args)
}

function runWithFeedback (onFeedback, cwd, ...args) {
	return new Promise((resolve, reject) => {
		log.debug(`spawning ${args.join(' ')} in ${cwd || 'current directory'}`)
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