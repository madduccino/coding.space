import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import {withAuthorization} from '../Session';
import {withMail} from '../Mail';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const INITIAL_STATE = {
  name: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
  isAdmin: false,
  isTeacher: false,
};
class NewUserFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE   };
  }

  onSubmit = event => {
    const { name, username, passwordOne, isAdmin, isTeacher } = this.state;
    const roles = {};
    if(isAdmin) roles[ROLES.ADMIN] = ROLES.ADMIN;
    if(isTeacher) roles[ROLES.TEACHER] = ROLES.TEACHER;
    if(!isAdmin && !isTeacher) roles[ROLES.STUDENT] = ROLES.STUDENT;

      fetch("/api/createUser", {
        method:"POST",
        headers: {
          Accept: "application/json",
          'Content-Type':"application/json",
        },
        body: JSON.stringify({
          email:"students+"+username+"@thecodingspace.com",
          password:passwordOne,
        })
      })
        .then((response)=>{
          var {uid} = response.json().then(data =>{
            return this.props.firebase
              .user(uid)
              .set({
                Email:data.email,
                DisplayName:data.displayName,
                key:data.uid,
                roles,
              })
          });
          
        })
        .catch((response)=>{
          console.log(response);
          //this.setState({ error: response.body.json().error });
        })
      event.preventDefault();
  }
  onChange = event => {
    
    if(event.target.name === "name")
      this.setState({ username: event.target.value.trim().replace(/ /g,'.')})
  	this.setState({ [event.target.name]: event.target.value });
    

  };
  render() {
  	const {
  		name,
  		username,
  		passwordOne,
  		passwordTwo,
  		error,
      isAdmin,
      isTeacher,
  	} = this.state;
  	const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      username === '' ||
      name === '';

    return (

      <form onSubmit={this.onSubmit}>
	      <input
	          name="name"
	          value={name}
	          onChange={this.onChange}
	          type="text"
	          placeholder="Full Name"
	        />
	        <input
	          name="username"
	          value={username}
            disabled={true}
	          onChange={this.onChange}
	          type="text"
	          placeholder="Username"
	        />
	        <input
	          name="passwordOne"
	          value={passwordOne}
	          onChange={this.onChange}
	          type="password"
	          placeholder="Password"
	        />
	        <input
	          name="passwordTwo"
	          value={passwordTwo}
	          onChange={this.onChange}
	          type="password"
	          placeholder="Confirm Password"
	        />
          <label>
            Admin:
            <input
              name="isAdmin"
              type="checkbox"
              checked={isAdmin}
              onChange={this.onChange}/>
          </label>
          <label>
            Teacher:
            <input
              name="isTeacher"
              type="checkbox"
              checked={isTeacher}
              onChange={this.onChange}/>
          </label>
	        <button disabled={isInvalid ? true : null} type="submit">Sign Up</button>
	        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN];
const NewUserForm =  withFirebase(withAuthorization(condition)(NewUserFormBase));//withMail(withAuthorization(withFirebase(SignUpFormBase)));
  
export default NewUserForm;
