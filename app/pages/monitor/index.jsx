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
		<article>
			<List
				{...executions}
				resource="/api/monitor.executions"
				Table={Executions}
				dispatch={createDispatch('executions', dispatch)} />
		</article>
		<aside>
			<section>
				<h2>agents</h2>
				<List
					{...agents}
					resource="/api/monitor.agents"
					Table={Agents}
					dispatch={createDispatch('agents', dispatch)} />
			</section>
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
		</aside>
	</div>

	function Executions ({ items }) {
		return <div>{items.map(it => <div className="execution">
			<div className={`props ${it.is_failed ? 'failed' : 'succeeded'}`}>
				<div>
					<i className="fa fa-clock-o" aria-hidden="true"></i><span> </span>
					{moment(it.finished_at || it.updated_at || it.started_at).format('MMM DD, HH:mm:ss')}
				</div>
				<div><i className="fa fa-github" aria-hidden="true"></i> {it.repository}</div>
				<div><i className="fa fa-code-fork" aria-hidden="true"></i> {it.branch}</div>
				<div><i className="fa fa-hashtag" aria-hidden="true"></i> {it.commit}</div>
				<div><i className="fa fa-cog" aria-hidden="true"></i> {it.agent}</div>
				<div><i className="fa fa-play" aria-hidden="true"></i> {it.stage}</div>
			</div>
			<pre>{it.feedback}</pre>
		</div>)}</div>
	}

	function Agents ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>name</th>
					<th>connected</th>
					<th>stage</th>
					<th title="repository">rep.</th>
					<th title="branch">br.</th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td title={it.ip}>{it.name || it.ip}</td>
				<td title={moment(it.connected_at).fromNow()}>{moment(it.connected_at).format('MMM DD, HH:mm')}</td>
				<td>{it.stage || <em>any</em>}</td>
				<td>{it.repository || <em>any</em>}</td>
				<td>{it.branch || <em>any</em>}</td>
			</tr>)}</tbody>
		</table>
	}

	function Repositories ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>name</th>
					<th>last upd.</th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td>{it.name}</td>
				<td>{moment(it.updated_at || it.created_at).format('MMM DD, HH:mm')}</td>
			</tr>)}</tbody>
		</table>
	}

	function Branches ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>name</th>
					<th>rep.</th>
					<th>last upd.</th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td>{it.name}</td>
				<td>{it.repository}</td>
				<td>{moment(it.updated_at || it.created_at).format('MMM DD, HH:mm')}</td>
			</tr>)}</tbody>
		</table>
	}
}