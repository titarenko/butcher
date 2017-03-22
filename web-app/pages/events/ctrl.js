const crypto = require('crypto')
const { validation, security } = require('buhoi')

const pg = require('../../pg')
const bus = require('../../bus')
const config = require('../config')

// 'https://developer.github.com/v3/repos/hooks/#create-a-hook'

module.exports = { create: security.bypass(validate, create) }

function validate (params, req) {
	const header = req.headers['x-hub-signature']
	if (!header || !header.startsWith('sha1=')) {
		throw new validation.ValidationError({ 'x-hub-signature': 'invalid format' })
	}

	const actualHash = header.slice(5)
	const expectedHash = crypto
		.createHmac('sha1', config.github.secret)
		.update(req.rawBody)
		.digest('hex')

	if (actualHash != expectedHash) {
		throw new validation.ValidationError({ 'x-hub-signature': 'invalid hash' })
	}
}

function create (params, req) {
	return pg('events')
		.insert({
			time: new Date(),
			ip: req.ip,
			headers: req.headers,
			body: req.body,
		})
		.returning('*')
		.then(it => it[0])
		.tap(ev => bus.emit('github event', ev))
		.return()
}