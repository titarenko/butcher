const fs = require('fs')
const { spawn } = require('child_process')
const Promise = require('bluebird')

const readFile = Promise.promisify(fs.readFile, { context: fs })

module.exports = execute

function execute ({ command, onFeedback }) {
	const location = `/var/lib/butcher/${command.repository.name}`
	return cloneFinallyFetch(command.repository.url, location)
		.then(() => copyCheckoutFinallyPull(location, command.branch))
		.then(() => readExecute(location, command, onFeedback))
		.then(() => command.stage == 'clear' ? remove(location, command.branch) : undefined)
}

function cloneFinallyFetch (url, location) {
	const masterLocation = `${location}/master`
	return run(undefined, 'mkdir', '-p', masterLocation)
		.then(() => run(masterLocation, 'git', 'clone', url, '.'))
		.finally(() => run(masterLocation, 'git', 'fetch'))
}

function copyCheckoutFinallyPull (location, branch) {
	const masterLocation = `${location}/master`
	const branchLocation = `${location}/${branch}`
	return run(undefined, 'mkdir', '-p', branchLocation)
		.then(() => run('cp', '-r', masterLocation, branchLocation))
		.then(() => run(branchLocation, 'git', 'checkout', branch))
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
		const child = spawn(args[0], ...args.slice(0), { cwd })
		if (onFeedback) {
			child.stdout.on('data', onFeedback)
			child.stderr.on('data', onFeedback)
		}
		child.on('close', code => {
			if (code == 0) {
				resolve()
			} else {
				reject(new Error(`command ${args.join(' ')} exited with code ${code}`))
			}
		})
	})
}