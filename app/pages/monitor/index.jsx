const { combineReducers } = require('redux')
const { scope: { createReducer, createDispatch }, actions: { changeQuery } } = require('buhoi-client')
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

function Monitor ({ repositories, branches, executions, agents, route, dispatch }) {
	const { rid, bid } = route.query || { }

	const executionsDispatch = createDispatch('executions', dispatch)
	const agentsDispatch = createDispatch('agents', dispatch)
	const repositoriesDispatch = createDispatch('repositories', dispatch)
	const branchesDispatch = createDispatch('branches', dispatch)

	return <div className="monitor">
		<article>
			<List
				{...executions}
				resource="/api/monitor.executions"
				query={{ repository_id: rid, branch_id: bid }}
				Table={Executions}
				dispatch={executionsDispatch} />
		</article>
		<aside>
			<section>
				<h2>repositories</h2>
				<List
					{...repositories}
					resource="/api/monitor.repositories"
					Table={Repositories}
					dispatch={repositoriesDispatch} />
			</section>
			<section>
				<h2>branches</h2>
				<List
					{...branches}
					resource="/api/monitor.branches"
					query={{ repository_id: rid }}
					Table={Branches}
					dispatch={branchesDispatch} />
			</section>
			<section>
				<h2>agents</h2>
				<List
					{...agents}
					resource="/api/monitor.agents"
					Table={Agents}
					dispatch={agentsDispatch} />
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
			<tbody>{items.map(it => <tr
				className={rid == it.id ? 'selected' : 'selectable'}
				onClick={() => toggleRepository(it)}
			>
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
			<tbody>{items.map(it => <tr
				className={bid == it.id ? 'selected' : 'selectable'}
				onClick={() => toggleBranch(it)}
			>
				<td>{it.name}</td>
				<td>{it.repository}</td>
				<td>{moment(it.updated_at || it.created_at).format('MMM DD, HH:mm')}</td>
			</tr>)}</tbody>
		</table>
	}

	function toggleRepository (it) {
		dispatch(changeQuery({ rid: rid == it.id ? undefined : it.id, bid: undefined }))
		branchesDispatch(List.actions.invalidate())
		executionsDispatch(List.actions.invalidate())
	}

	function toggleBranch (it) {
		dispatch(changeQuery({ bid: bid == it.id ? undefined : it.id }))
		executionsDispatch(List.actions.invalidate())
	}
}