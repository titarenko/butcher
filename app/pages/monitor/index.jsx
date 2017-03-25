const { combineReducers } = require('redux')
const { scope: { createReducer, createDispatch } } = require('buhoi-client')
const { List } = require('buhoi-ui')

require('./style.scss')

module.exports = Monitor
module.exports.reducer = combineReducers({
	repositories: createReducer('repositories', List.reducer),
	branches: createReducer('branches', List.reducer),
})

function Monitor ({ repositories, branches, dispatch }) {
	return <div className="monitor">
		<section>
			<h2>repositories</h2>
			<List
				{...repositories}
				resource="/api/monitor.repositories"
				Table={Repositories}
				dispatch={createDispatch('repositories', dispatch)} />
		</section>
		<section>
			<h2>branches</h2>
			<List
				{...branches}
				resource="/api/monitor.branches"
				Table={Branches}
				dispatch={createDispatch('branches', dispatch)} />
		</section>
	</div>

	function Repositories ({ items }) {
		return <ul>{items.map(it => <li>{it.name}</li>)}</ul>
	}

	function Branches ({ items }) {
		return <ul>{items.map(it => <li>{it.name}</li>)}</ul>
	}
}