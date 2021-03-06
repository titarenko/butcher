const { combineReducers } = require('redux')
const {
	scope: { createReducer, createDispatch },
	actions: { navigateTo, changeQuery },
} = require('buhoi-client')
const { List, Edit, TextInput } = require('buhoi-ui')

require('./style.scss')

module.exports = Config
module.exports.reducer = combineReducers({
	repositories: createReducer('repositories', List.reducer),
	repository: createReducer('repository', Edit.reducer),
	agents: createReducer('agents', List.reducer),
	agent: createReducer('agent', Edit.reducer),
})

function Config ({ repositories, repository, agents, agent, route, dispatch }) {
	const repositoriesDispatch = createDispatch('repositories', dispatch)
	const repositoryDispatch = createDispatch('repository', dispatch)

	const agentsDispatch = createDispatch('agents', dispatch)
	const agentDispatch = createDispatch('agent', dispatch)

	const query = route.query || { }

	return <div className="config">
		<section>
			<h2>
				<button
					title="back to monitor"
					onClick={() => dispatch(navigateTo('/monitor'))}
				><i className="fa fa-arrow-left" aria-hidden="true"></i> back</button>
			</h2>
		</section>
		<section>
			<h2>
				<span>repositories </span>
				<button
					title="add"
					onClick={() => editRepository({ id: null })}
				><i className="fa fa-plus" aria-hidden="true"></i></button>
			</h2>
			{query.r !== undefined
				? <Edit
					{...repository}
					id={query.r}
					removable
					resource="/api/repositories"
					onFinish={() => editRepository()}
					Form={Repository}
					dispatch={repositoryDispatch} />
				: <List
					{...repositories}
					dispatch={repositoriesDispatch}
					resource="/api/repositories"
					Table={Repositories} />
			}
		</section>
		<section>
			<h2>
				<span>agents </span>
				<button
					title="add"
					onClick={() => editAgent({ id: null })}
				><i className="fa fa-plus" aria-hidden="true"></i></button>
			</h2>
			{query.a !== undefined
				? <Edit
					{...agent}
					id={query.a}
					removable
					resource="/api/agents"
					onFinish={() => editAgent()}
					Form={Agent}
					dispatch={agentDispatch} />
				: <List
					{...agents}
					dispatch={agentsDispatch}
					resource="/api/agents"
					Table={Agents} />
			}
		</section>
	</div>

	function Repositories ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>name</th>
					<th></th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td>{it.name}</td>
				<td>
					<button
						title="edit"
						onClick={() => editRepository(it)}
					><i className="fa fa-pencil" aria-hidden="true"></i></button>
				</td>
			</tr>)}</tbody>
		</table>
	}

	function editRepository (it) {
		dispatch(changeQuery({ r: it ? it.id : undefined }))
		if (!it) {
			repositoryDispatch(Edit.actions.reset())
			repositoriesDispatch(List.actions.invalidate())
		}
	}

	function Repository ({ fields, validationErrors }) {
		return <div>
			<TextInput
				label="name"
				error={validationErrors.name}
				value={fields.name}
				onChange={v => repositoryDispatch(Edit.actions.setField('name', v))} />
			<TextInput
				label="secret"
				error={validationErrors.secret}
				value={fields.secret}
				onChange={v => repositoryDispatch(Edit.actions.setField('secret', v))} />
			<TextInput
				label="script"
				lines="auto"
				error={validationErrors.script}
				value={fields.script}
				onChange={v => repositoryDispatch(Edit.actions.setField('script', v))} />
		</div>
	}

	function Agents ({ items }) {
		return <table>
			<thead>
				<tr>
					<th>name</th>
					<th>stage</th>
					<th>rep.</th>
					<th>branch</th>
					<th></th>
				</tr>
			</thead>
			<tbody>{items.map(it => <tr>
				<td>{it.name}</td>
				<td>{it.stage || <em>any</em>}</td>
				<td>{it.repository || <em>any</em>}</td>
				<td>{it.branch || <em>any</em>}</td>
				<td>
					<button
						title="edit"
						onClick={() => editAgent(it)}
					><i className="fa fa-pencil" aria-hidden="true"></i></button>
				</td>
			</tr>)}</tbody>
		</table>
	}

	function editAgent (it) {
		dispatch(changeQuery({ a: it ? it.id : undefined }))
		if (!it) {
			agentDispatch(Edit.actions.reset())
			agentsDispatch(List.actions.invalidate())
		}
	}

	function Agent ({ fields, validationErrors }) {
		return <div>
			<TextInput
				label="name"
				value={fields.name}
				error={validationErrors.name}
				onChange={v => agentDispatch(Edit.actions.setField('name', v))} />
			<TextInput
				label="token"
				value={fields.token}
				error={validationErrors.token}
				onChange={v => agentDispatch(Edit.actions.setField('token', v))} />
			<TextInput
				label="stage"
				value={fields.stage}
				error={validationErrors.stage}
				onChange={v => agentDispatch(Edit.actions.setField('stage', v))} />
			<TextInput
				label="repository"
				value={fields.repository}
				error={validationErrors.repository}
				onChange={v => agentDispatch(Edit.actions.setField('repository', v))} />
			<TextInput
				label="branch"
				value={fields.branch}
				error={validationErrors.branch}
				onChange={v => agentDispatch(Edit.actions.setField('branch', v))} />
		</div>
	}
}