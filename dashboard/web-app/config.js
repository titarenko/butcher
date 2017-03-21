const secret = process.env.BUTCHER_SECRET
if (!secret) {
	throw new Error(`BUTCHER_SECRET is missing (see ${docsUrl})`))
}

module.exports = { github: { secret } }