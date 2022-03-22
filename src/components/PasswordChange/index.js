import React, {Component} from 'react';

import { withFirebase } from '../Firebase';

class PasswordChangeForm extends Component {
	constructor(props){
		super(props);

		this.state = {
			passwordOne:'',
			passwordTwo:'',
			error:null,
			success:null,
		}
	}

	onSubmit = event => {
		const { passwordOne } = this.state;

		this.props.firebase
			.doPasswordUpdate(passwordOne)
			.then(() => {
				this.setState({
					passwordOne:'',
					passwordTwo:'',
					error:null,
					success:'Password successfully updated! Code on, my friend!',
				})
			})
			.error((error) => {
				this.setState({error})
			})
		event.preventDefault();
	}

	onChange = event => {
		this.setState({ [event.target.name] : event.target.name });
	}

	render(){
		const {passwordOne, passwordTwo, error, success} = this.state;

		const isInvalid =
			passwordOne !== passwordTwo || passwordOne === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name='passwordOne'
					value={passwordOne}
					onChange={this.onChange}
					type='password'
					placeholder='New Password'
				/>
				<input
					name='passwordTwo'
					value={passwordTwo}
					onChange={this.onChange}
					type='password'
					placeholder='Confirm Password'
				/>
				<button disabled={isInvalid} type="submit">
					Reset My Password
				</button>
				{error && <p>{error.message}</p>}
			</form>
		)
	}
}

export default withFirebase(PasswordChangeForm);