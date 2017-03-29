const { combineReducers } = require('redux')

const { actions: { navigateTo, write } } = require('buhoi-client')
const { Same } = require('buhoi-ui')

require('./login.scss')

module.exports = Login
Login.reducer = combineReducers({ validationErrors: validationErrorsReducer })

function Login ({ app, validationErrors, dispatch }) {
	if (app.user) {
		dispatch(navigateTo())
		return <Same />
	}

	return <article className="login">
		<form onSubmit={handleSubmit}>
			<div className="input">
				<input type="text" name="name" placeholder="name" />
				{validationErrors.name
					? <span className="validation-error">{validationErrors.name}</span>
					: null
				}
			</div>
			<div className="input">
				<input type="password" name="password" placeholder="password" />
				{validationErrors.password
					? <span className="validation-error">{validationErrors.password}</span>
					: null
				}
			</div>
			<input type="submit" value="log in" />
		</form>
	</article>

	function handleSubmit (e) {
		e.preventDefault()
		const credentials = { name: e.target.name.value, password: e.target.password.value }
		dispatch(write('LOGIN', '/api/users.login', credentials))
	}
}

function validationErrorsReducer (state = { }, action) {
	switch (action.type) {
		case 'LOGIN_STARTED': return { }
		case 'LOGIN_FAILED': return action.error.statusCode == 400 ? action.error.body : { }
		default: return state
	}
}