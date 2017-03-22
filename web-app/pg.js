const config = require('../../config')
const knex = require('knex')(config.pg)
module.exports = knex