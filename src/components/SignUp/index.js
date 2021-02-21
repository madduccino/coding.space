import React, { Component } from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {
  name: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  success: null,
  isAdmin: false,
  isTeacher: false,
};
class NewUserFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
    this.onChange = this.onChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
  }

  componentDidMount() {}

  onSubmit = async (event) => {
    event.preventDefault();

    const { name, username, passwordOne, isAdmin, isTeacher } = this.state;
    const roles = {};
    if (isAdmin) roles[ROLES.ADMIN] = ROLES.ADMIN;
    if (isTeacher) roles[ROLES.TEACHER] = ROLES.TEACHER;
    if (!isAdmin && !isTeacher) roles[ROLES.STUDENT] = ROLES.STUDENT;

    try {
      const response = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "students+" + username + "@thecodingspace.com",
          password: passwordOne,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw data.error;
      }

      const firebaseRes = await this.props.firebase.profile(data.uid).set({
        Email: data.email,
        DisplayName: name,
        key: data.uid,
        roles,
        About: "",
        Age: "",
        Username: username,
        ThumbnailFilename: "",
        Status: "DRAFT",
      });

      this.setState((prev) => ({
        success: `Account created! <a target="_blank" href="/profiles/${data.uid}">Visit New Profile</a>`,
      }));
    } catch (error) {
      console.error(error);
      console.log("error is being logged in catch block");
      this.setState((prev) => ({ error: error }));
    }
  };
  onChange = (event) => {
    if (event.target.name === "name")
      this.setState({ username: event.target.value.trim().replace(/ /g, ".") });
    this.setState({ [event.target.name]: event.target.value });
  };
  onCheckboxChange = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
  };
  render() {
    const {
      name,
      username,
      passwordOne,
      passwordTwo,
      error,
      success,
      isAdmin,
      isTeacher,
    } = this.state;
    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      username === "" ||
      name === "";
    const { authUser } = this.props;
    return (
      <section id="signup">
        <div className="main">
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

            {!!authUser && !!authUser.roles["ADMIN"] && (
              <div className="labels">
                <label>
                  <input
                    type="checkbox"
                    name="isAdmin"
                    onChange={this.onCheckboxChange}
                  />
                  Admin
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="isTeacher"
                    onChange={this.onCheckboxChange}
                  />
                  Teacher
                </label>
              </div>
            )}
            <button disabled={isInvalid ? true : null} type="submit">
              Sign Up
            </button>
            {!!error && <p>{error.message}</p>}
            {!!success && <div dangerouslySetInnerHTML={{ __html: success }} />}
          </form>
        </div>
      </section>
    );
  }
}

const condition = (authUser) =>
  authUser &&
  (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const NewUserForm = withFirebase(withAuthorization(condition)(NewUserFormBase));
//withMail(withAuthorization(withFirebase(SignUpFormBase)));

export default NewUserForm;
