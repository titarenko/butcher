const reduxThunk = require('redux-thunk')
const reduxLogger = require('redux-logger')

const { start } = require('buhoi-client')

start({
	createContext: () => require.context('./pages', true, /\.jsx$/),
	acceptHotUpdate: module.hot && module.hot.accept,
	defaultRoute: '/monitor',
	middleware: [
		reduxThunk.default,
		process.env.NODE_ENV == 'development' ? reduxLogger.default : null,
	].filter(Boolean),
})