const { combineReducers } = require('redux')
const { scope: { createReducer, createDispatch } } = require('buhoi-client')
const { List } = require('buhoi-ui')
const moment = require('moment')

require('./style.scss')

module.exports = Monitor
module.exports.reducer = combineReducers({
	repositories: createReducer('repositories', List.reducer),
	branches: createReducer('branches', List.reducer),
	executions: createReducer('executions', List.reducer),
	agents: createReducer('agents', List.reducer),
})

function Monitor ({ repositories, branches, executions, agents, dispatch }) {
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
		<section>
			<h2>executions</h2>
			<List
				{...executions}
				resource="/api/monitor.executions"
				Table={Executions}
				dispatch={createDispatch('executions', dispatch)} />
		</section>
		<section>
			<h2>agents</h2>
			<List
				{...agents}
				resource="/api/monitor.agents"
				Table={Agents}
				dispatch={createDispatch('agents', dispatch)} />
		</section>
	</div>

	function Executions ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>start</th>
					<th>update</th>
					<th>finish</th>
					<th>feedback</th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td>{moment(it.created_at).format('MMM DD, HH:mm')}</td>
				<td>{moment(it.updated_at).format('mm:ss')}</td>
				<td>{moment(it.finished_at).format('mm:ss')}</td>
				<td>{it.feedback}</td>
			</tr>)}</tbody>
		</table>
	}

	function Agents ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>name</th>
					<th>role</th>
					<th title="repository">rep.</th>
					<th title="branch">br.</th>
					<th>connected</th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td title={it.ip}>{it.name || it.ip}</td>
				<td>{it.role}</td>
				<td>{it.repository || <em>any</em>}</td>
				<td>{it.branch || <em>any</em>}</td>
				<td title={moment(it.connected_at).fromNow()}>{moment(it.connected_at).format('MMM DD, HH:mm')}</td>
			</tr>)}</tbody>
		</table>
	}

	function Repositories ({ items }) {
		return <ul>{items.map(it => <li>{it.name}</li>)}</ul>
	}

	function Branches ({ items }) {
		return <ul>{items.map(it => <li>{it.name}</li>)}</ul>
	}
}