import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';



class ProfilePageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		projects: {},
 		profile:{},



 	}
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handleStepOnChange = this.handleStepOnChange.bind(this);
 	this.addStepHandler = this.addStepHandler.bind(this);
 	this.deleteStepHandler = this.deleteStepHandler.bind(this);
 	this.saveChangesHandler = this.saveChangesHandler.bind(this);
 	
 	//this.onChange = editorState => this.setState({editorState});
 	//console.log("hiya");

 }

 
 handleMouseEnter = (target) => {

 	if(this.state.canEdit){
 		return; //replace control with rich text editor
 	}
 };

 componentDidMount(){
 	//console.log(this.authUser);

 	const {key} = this.props.match.params;
 	this.props.firebase.profile(key).on('value',snapshot => {
		this.setState({
			profile:snapshot.val()
		})
		this.props.firebase.projects().once('value')
			.then(snapshot => {
 				const {key} = this.props.match.params;
 				const projects = Object.values(snapshot.val()).filter(project=>project.Author===key);
 				/*const filProjects = [];
 				for(var keyz in projects){
 					if(projects[keyz].Author === key)
 						filProjects.push(projects[keyz]);
 				}*/
 				

 		
		 		this.setState({
		 			projects: projects,
		 			loading:false,
		 		})
 		

 		
 	})
	})
 	


 }

 componentWillUnmount(){
 	this.props.firebase.profile().off();
 	this.props.firebase.projects().off();
 }
 handlePDescriptionOnChange(value){

 }
 handleStepOnChange(value,step){

 }
 deleteStepHandler(event,key){

 }
 addStepHandler(event){

 }
 saveChangesHandler(event){

 }

 render(){
 	
 	const {projects, loading, profile} = this.state;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
 	
 	//can edit
	if(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) )
 	{
 		return (
 			<div>
 				<h1>{profile.Name}</h1>
 				<div className={'container'}>
 					<div classname={'block'}>About Me</div>
 					<TCSEditor className={'block'} onEditorChange={this.handlePDescriptionOnChange} placeholder={'Project Description'} text={profile.About}/>
 				</div>
 				<div className={'container'}>
 					<div classname={'block'}>My Age</div>
 					<TCSEditor onEditorChange={this.handlePDescriptionOnChange} placeholder={'Project Description'} text={profile.Age}/>
 				</div>
 				<div className={'container'}>
 					<div classname={'block'}>Username</div>
 					<TCSEditor onEditorChange={this.handlePDescriptionOnChange} placeholder={'Project Description'} text={profile.Username}/>
 				</div>
 				<div className={'container'}>
 					<div classname={'block'}>My Projects</div>
 					{projects.map(project => (
 						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
 				</div>
 				
 			</div>
 		)

 	}

 	return (
			<div>
 				<h1>{profile.Name}</h1>
 				<div className={'container'}>
 					<div classname={'block'}>About Me</div>
 					<div class="block" dangerouslySetInnerHTML={{__html:profile.About}}/>
 				</div>
 				<div className={'container'}>
 				<div classname={'block'}>My Age</div>
 					<div class="block" dangerouslySetInnerHTML={{__html:profile.Age}}/>
 				</div>
 				<div className={'container'}>
 					<div classname={'block'}>Email Address</div>
 					<a href={"mailto:" + "students+"+ profile.Username + "@thecodingspace.com"} class="block" >
 						{"students+"+ profile.Username + "@thecodingspace.com"}
 					</a>
 				</div>
 				<div className={'container'}>
 					<div classname={'block'}>My Projects</div>
 					{projects.map(project => (
 						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
 				</div>
 				
 			</div>
 		)
}
}


const ProfilePage = withFirebase(withAuthentication(ProfilePageBase));

export default ProfilePage;