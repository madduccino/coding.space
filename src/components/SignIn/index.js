import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import {withAuthorization} from '../Session';

import * as ROUTES from '../../constants/routes';
const SignInPage = () => (
  <section id="signIn">
    <div className="main">
      <h1>Sign In</h1>
      <SignInForm />
      <PasswordForgetLink />
    </div>
  </section>  
);
const INITIAL_STATE = {
  username: '',
  password: '',
  error: null,
};
class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }
  onSubmit = event => {
    const { username, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword((username.startsWith("_") ? username.substring(1) : 'students+' + username) + "@thecodingspace.com", password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.LANDING);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  render() {
    const { username, password, error } = this.state;
    const isInvalid = password === '' || username === '';
    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Username"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <button disabled={isInvalid} type="submit">
          Sign In
        </button>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}
const SignInForm = withRouter(withFirebase(SignInFormBase));
export default SignInPage;
export { SignInForm };