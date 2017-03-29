const { combineReducers } = require('redux')
const reduxThunk = require('redux-thunk')
const reduxLogger = require('redux-logger')

const { start } = require('buhoi-client')

start({
	createContext: () => require.context('./pages', true, /\.jsx$/),
	acceptHotUpdate: module.hot && module.hot.accept,
	defaultRoute: '/monitor',
	loginRoute: '/users/login',
	appReducer: combineReducers({ user: userReducer }),
	middleware: [
		reduxThunk.default,
		process.env.NODE_ENV == 'development' ? reduxLogger.default : null,
	].filter(Boolean),
})

function userReducer (state = null, action) {
	switch (action.type) {
		case 'LOGIN_SUCCEEDED': return action.result
		default: return state
	}
}