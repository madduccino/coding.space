import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import {withFirebase} from '../Firebase';
import * as ROUTES from '../../constants/routes';

const PasswordForgetPage = () => (
	<div>
		<h1>Password Forget</h1>
		<PasswordForgetForm />
	</div>
);

class PasswordForgetFormBase extends Component {
	constructor(props){
		super(props);

		this.state = {
			username:'',
			error:null,
		}

	}
	onSubmit = event => {
		const {username} = this.state;
		this.props.firebase
			.doPasswordReset('students+'+username+'@thecodingspace.com')
			.then(() => {
				this.setState({
					username:'',
					error:null,
					success:'Password reset email sent!'
				})
			})
			.catch(error => {
				this.setState({
					error
				})
			})

		event.preventDefault();
	}

	onChange = event =>{
		this.setState({ [event.target.name] : event.target.value});
	};

	render() {
		const {username, error} = this.state;

		const isInvalid = username === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="username"
					value={this.state.username}
					onChange={this.onChange}
					type="text"
					placeholder="Username"
				/>
				<button disabled={isInvalid} type="submit">
					Reset My Password
				</button>

				{error && <p>{error.message}</p>}
			</form>
		)
	}

}

const PasswordForgetLink = () => (
	<p>
		<Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
	</p>
)
export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);
export { PasswordForgetForm , PasswordForgetLink}