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
			email:'',
			error:null,
		}

	}
	onSubmit = event => {
		const {email} = this.state;
		this.props.Firebase
			.doPasswordReset(email)
			.then(() => {
				this.setState({
					email:'',
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
		const {email, error} = this.state;

		const isInvalid = email === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="email"
					value={this.state.email}
					onChange={this.onChange}
					type="text"
					placeholder="Email Address"
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