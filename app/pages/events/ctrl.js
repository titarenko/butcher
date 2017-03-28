const _ = require('lodash')
const crypto = require('crypto')
const { validation, security } = require('buhoi')

const pg = require('../../pg')
const bus = require('../../bus')

module.exports = { create: security.bypass(validate, create) }

// 'https://developer.github.com/v3/repos/hooks/#create-a-hook'

function validate (params, req) {
	const header = req.headers['x-hub-signature']
	if (!header || !header.startsWith('sha1=')) {
		throw new validation.ValidationError({ 'x-hub-signature': 'invalid format' })
	}

	return pg('repositories')
		.select('secret')
		.where({ name: _.get(req, 'body.repository.name') })
		.first()
		.then(repository => {
			if (!repository) {
				throw new validation.ValidationError({ 'repository': 'unknown' })
			}
			const actualHash = header.slice(5)
			const expectedHash = crypto
				.createHmac('sha1', repository.secret)
				.update(req.rawBody)
				.digest('hex')

			if (actualHash != expectedHash) {
				throw new validation.ValidationError({ 'x-hub-signature': 'invalid hash' })
			}
		})
}

function create (params, req) {
	return pg('events')
		.insert({
			occurred_at: new Date(),
			ip: req.ip,
			headers: req.headers,
			body: req.body,
		})
		.returning('*')
		.then(it => it[0])
		.tap(ev => bus.emit('github event', ev))
		.return()
}