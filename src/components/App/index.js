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
import NewClassPage from '../NewClass';
import Scratch from '../Scratch';
import MessageOverlay from '../MessageOverlay';
import * as ROUTES from '../../constants/routes';
import {withAuthentication} from '../Session';
import AuthUserContext from '../Session/context';
import {withFirebase} from '../Firebase';
import './index.css';


class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			showFooter:true,
			showMessage:false,
			messages:null,
			authUser:null,
		}
		this.setGlobalState = this.setGlobalState.bind(this);
		
		

		//this.props.setGlobalProps = this.setGlobalProps;
	}
	setGlobalState(map){
		this.setState({...map,showMessage: (!!map['messages'] ? true : false)});

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
		const {showMessage,messages} = this.state;

		return (
				<AuthUserContext.Provider value={this.state.authUser}>
					<Router>
						<div>
							<Route component={Navigation} />
							<hr />
							<Route exact path={ROUTES.LANDING} render={(props) =><LandingPage {...this.props} setGlobalState={this.setGlobalState}  />} />
							<Route path={ROUTES.NEW_USER} render={(props)=><NewUserForm {...props} setGlobalState={this.setGlobalState}/>} />
							<Route path={ROUTES.SIGN_IN} render={(props)=><SignInPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.PASSWORD_FORGET} render={(props)=><PasswordForgetPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route exact path={ROUTES.CLASSES} render={(props)=><ClassesPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.ACCOUNT} render={(props)=><AccountPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.ADMIN} render={(props)=><AdminPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.SCRATCH} render={(props)=><Scratch {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.PROJECT} render={(props)=><ProjectPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.PROFILE} render={(props)=><ProfilePage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.CLASS} render={(props)=><ClassPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.NEW_PROJECT} render={(props)=><NewProjectPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.NEW_CLASS} render={(props)=><NewClassPage {...props} setGlobalState={this.setGlobalState} />} />
							{this.state.showFooter &&
								<Footer showFooter={this.state.showFooter} />
							}
						</div>

					</Router>
					{showMessage && !!messages && (
						<MessageOverlay messages={messages}  setGlobalState={this.setGlobalState}/>
					) }
					

				</AuthUserContext.Provider>


		)
	}
}

export default withFirebase(App);

