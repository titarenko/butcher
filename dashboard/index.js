const net = require('net')
const log = require('totlog')(__filename)

const agents = []

const server = net.createServer(socket => {
	socket.on('data', data => {
		const message = JSON.parse(data.toString())
		handleFeedback(message, socket)
	})
	socket.on('close', () => removeAgent(socket))
	socket.on('error', error => log.error(`connection failed due to ${error.stack}`))
})

function handleFeedback (message, socket) {
	if (message.type == 'AUTHENTICATE') {
		log.debug('%j', message)
	}
}

server.listen(3000, 'localhost')