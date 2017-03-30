const { webpack } = require('buhoi')
module.exports = webpack(__dirname)
if (process.env.NODE_ENV == 'production') {
	module.exports.devtool = undefined
}