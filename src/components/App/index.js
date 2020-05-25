import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import Footer from '../Footer';
import Navigation from '../Navigation';
import LandingPage from '../Landing';
import NewUserForm from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import ClassesPage from '../Classes';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import ProjectPage from '../Project';
import ProfilePage from '../Profile';
import ClassPage from '../Class';
import NewProjectPage from '../NewProject';
import Scratch from '../Scratch';
import * as ROUTES from '../../constants/routes';
import {withAuthentication} from '../Session';
import AuthUserContext from '../Session/context';
import {withFirebase} from '../Firebase';


class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			showFooter:true,
			authUser:null,
		}
		this.setGlobalState = this.setGlobalState.bind(this);
		//this.props.setGlobalProps = this.setGlobalProps;
	}
	setGlobalState(map){
		this.setState({...map});
		//console.log(this.state);
	}
	componentDidMount(){
		this.listener = this.props.firebase.onAuthUserListener(
			authUser=>{
				this.setState({ authUser});
				
			},
			()=>{
				this.setState({authUser:null});
			})
	}
	componentWillUnmount(){
		this.listener();
	}
	render(){

		return (
				<AuthUserContext.Provider value={this.state.authUser}>
					<Router>
						<div>
							<Route component={Navigation} />
							<hr />
							<Route exact path={ROUTES.LANDING} render={(props) =><LandingPage {...this.props} setGlobalState={this.setGlobalState}  />} />
							<Route path={ROUTES.NEW_USER} component={NewUserForm} />
							<Route path={ROUTES.SIGN_IN} component={SignInPage} />
							<Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
							<Route exact path={ROUTES.CLASSES} component={ClassesPage} />
							<Route path={ROUTES.ACCOUNT} component={AccountPage} />
							<Route path={ROUTES.ADMIN} component={AdminPage} />
							<Route path={ROUTES.SCRATCH} component={Scratch} />
							<Route path={ROUTES.PROJECT} component={ProjectPage} />
							<Route path={ROUTES.PROFILE} component={ProfilePage} />
							<Route path={ROUTES.CLASS} component={ClassPage} />
							<Route path={ROUTES.NEW_PROJECT} component={NewProjectPage} />
							{this.state.showFooter &&
								<Footer showFooter={this.state.showFooter} />
							}
						</div>

					</Router>
				</AuthUserContext.Provider>

		)
	}
}

export default withFirebase(App);

