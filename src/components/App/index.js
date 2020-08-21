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
import UntutorialPage from '../Untutorial';
import ProfilePage from '../Profile';
import ClassPage from '../Class';
import NewProjectPage from '../NewProject';
import Simulator from '../Simulator';
import JetFuel from '../JetFuel';
import ProgressReviews from '../ProgressReviews';
import Question from '../Question';
import ResourcePage from '../Resources';
import NewClassPage from '../NewClass';
import LaunchPad from '../LaunchPad';
import Universe from '../Universe';
import UniversePublish from '../UniversePublish';
import MessageOverlay from '../MessageOverlay';
import * as ROUTES from '../../constants/routes';
import {withAuthentication} from '../Session';
import AuthUserContext from '../Session/context';
import {withFirebase} from '../Firebase';
import '../../index.scss';


class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			showFooter:true,
			showMessage:false,
			messages:null,
			authUser:null,
			showNav: false
		}
		this.setGlobalState = this.setGlobalState.bind(this);
		
		

		//this.props.setGlobalProps = this.setGlobalProps;
	}
	setGlobalState(map){
		this.setState({...map,showMessage: (!!map['messages'] ? true : false)});

		//console.log(this.state);
	}
	componentDidMount(){
		document.body.addEventListener('click', this.handleClick);
		this.listener = this.props.firebase.onAuthUserListener(
			authUser=>{
				this.setState({ authUser});
				
			},
			()=>{
				this.setState({authUser:null});
			})
		
	}
	componentWillUnmount(){
		document.body.removeEventListener('click', this.handleClick);
		this.listener();
	}
	
	
	handleClick = (e) => {
		if(e.target.id=="menu" || e.target.parentElement.id=="menu") {
		  this.setState({showNav: !this.state.showNav})
		} else {
		  this.setState({showNav: false})
		}
	}
	
	render(){
		const {showMessage,messages} = this.state;

		return (
				<AuthUserContext.Provider value={this.state.authUser}>
					<Router>
						<div id="page-container">
							<section id="header">
							  <Route render={(props) => 
							    <Navigation {...props} showNav={this.state.showNav} />}
							  />
							</section>
							<Route exact path={ROUTES.LANDING} render={(props) =><LandingPage {...this.props} setGlobalState={this.setGlobalState}  />} />
							<Route path={ROUTES.NEW_USER} render={(props)=><NewUserForm {...props} setGlobalState={this.setGlobalState}/>} />
							<Route path={ROUTES.SIGN_IN} render={(props)=><SignInPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.PASSWORD_FORGET} render={(props)=><PasswordForgetPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route exact path={ROUTES.CLASSES} render={(props)=><ClassesPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route exact path={ROUTES.LAUNCHPAD} render={(props)=><LaunchPad {...props} setGlobalState={this.setGlobalState} />} />
							<Route exact path={ROUTES.UNIVERSE} render={(props)=><Universe {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.UNIVERSE_PUBLISH} render={(props)=><UniversePublish {...props} setGlobalState={this.setGlobalState} />} />
							<Route exact path={ROUTES.RESOURCE_HOME} render={(props)=><ResourcePage {...props} default={'GqrsER3FnGgSZwyTYgkkDdyyty92'} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.RESOURCES} render={(props)=><ResourcePage {...props} default={'GqrsER3FnGgSZwyTYgkkDdyyty92'} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.UNTUTORIAL} render={(props)=><UntutorialPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.PROFILE} render={(props)=><ProfilePage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.CLASS} render={(props)=><ClassPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.NEW_PROJECT} render={(props)=><NewProjectPage {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.SIMULATOR} render={(props)=><Simulator {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.PROGRESSREVIEWS} render={(props)=><ProgressReviews {...props} setGlobalState={this.setGlobalState} />} />
							<Route exact path={ROUTES.JETFUEL} render={(props)=><JetFuel {...props} setGlobalState={this.setGlobalState} />} />
							<Route path={ROUTES.QUESTION} render={(props)=><Question {...props} setGlobalState={this.setGlobalState} />} />
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

