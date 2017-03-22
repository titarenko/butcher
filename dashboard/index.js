const bus = require('./bus')
const { handleGithubEvent } = require('./engine/event-handlers')
const engineServer = require('./engine/server')

bus.on('github event', handleGithubEvent)

engineServer.create().listen(3001, 'localhost')