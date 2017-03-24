const { start } = require('buhoi-client')

start({
	createContext: () => require.context('./pages', true, /\.jsx$/),
	acceptHotUpdate: module.hot && module.hot.accept,
	defaultRoute: '/monitor',
})