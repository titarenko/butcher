const fs = require('fs')
const { spawn } = require('child_process')
const Promise = require('bluebird')

const readFile = Promise.promisify(fs.readFile, { context: fs })

module.exports = execute

function execute ({ repository: { name, url }, branch, command, onFeedback }) {
	const location = `/var/butcher/${name}`
	return cloneFetch(url, location)
		.then(() => copyCheckoutFinallyPull(location, branch))
		.then(() => readExecute(location, branch, command, onFeedback))
		.tap(() => command == 'delete' ? remove(location, branch) : undefined)
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

function readExecute (location, branch, commandName, onFeedback) {
	const branchLocation = `${location}/${branch}`
	return readFile(`${branchLocation}/.butcher.json`, 'utf-8')
		.then(JSON.parse)
		.then(config => config[commandName])
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
				reject(new Error(String(code)))
			}
		})
	})
}