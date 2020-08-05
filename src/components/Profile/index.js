import React from 'react';
import LazyImage from '../LazyImage';
import EmailLoader from '../EmailLoader';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';
import gmailApi from 'react-gmail'

 const TAB = {
 	PROGRESS:0,
 	UNTUTORIALS:1,
	 EMAIL:2,
	 PROFILE: 3
 }
 const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

class ProfilePageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		untutorials: {},
 		progress:{},
 		profile:{},
 		uploading:false,
 		uploadPercent:0,
 		dirty:false,
 		tab:TAB.PROFILE,
 	}
 	this.handleNotesOnChange = this.handleNotesOnChange.bind(this);
 	this.handleNotesOnSave = this.handleNotesOnSave.bind(this);
 	this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleStatusOnSave = this.handleStatusOnSave.bind(this);
 	this.handleAgeOnChange = this.handleAgeOnChange.bind(this);
 	this.handleAgeOnSave = this.handleAgeOnSave.bind(this);
 	this.handlePTitleOnChange = this.handlePTitleOnChange.bind(this);
 	this.handlePTitleOnSave = this.handlePTitleOnSave.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handleDisplayNameOnChange = this.handleDisplayNameOnChange.bind(this);
 	this.handleDisplayNameOnSave = this.handleDisplayNameOnSave.bind(this);
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);
 	this.handleAgeOnChange = this.handleAgeOnChange.bind(this);
 	this.handleAgeOnSave = this.handleAgeOnSave.bind(this);
 	this.saveChangesHandler = this.saveChangesHandler.bind(this);
 	
 	//this.onChange = editorState => this.setState({editorState});
 	//console.log("hiya");

 }
 handleMouseEnter = (target) => {

 	if(this.state.canEdit){
 		return; //replace control with rich text editor
 	}
 }
 componentDidMount(){
 	//console.log(this.authUser);

 	const {key} = this.props.match.params;
 	this.props.firebase.profile(key).on('value',snapshot => {
		 var snap = snapshot.val();
		 if(!snap.Notes)
		   snap.Notes='';
		this.setState({
			profile:snap,
			progress: !!snap.progress ? Object.values(snap.progress) : {},
		})
		this.props.firebase.untutorials().once('value')
			.then(snapshot => {
 				const {key} = this.props.match.params;
 				const untutorials = Object.values(snapshot.val()).filter(untutorial=>untutorial.Author===key);
 				/*const filProjects = [];
 				for(var keyz in projects){
 					if(projects[keyz].Author === key)
 						filProjects.push(projects[keyz]);
 				}*/
 				

 		
		 		this.setState({
		 			untutorials: untutorials,
		 			loading:false,
		 		})
 		

 		
 		})
	})
 	


 }
 componentWillUnmount(){
 	this.props.firebase.profile().off();
 	this.props.firebase.untutorials().off();
 }
  handleThumbnailUpload(event){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var pCopy = this.state.profile;
 	const {authUser} = this.props;
 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
 		pCopy.Status = 'DRAFT';
 	pCopy.ThumbnailFilename = uuidv4() + '.' + ext;

 	var storageRef = this.props.firebase.storage.ref('/public/' + pCopy.key + '/' + pCopy.ThumbnailFilename);
 	var task = storageRef.put(file);

 	task.on('state_changed',
 		(snapshot)=>{
 			//update
 			var percentage = 100 * snapshot.bytesTransferred / snapshot.totalBytes;
 			this.setState({uploadPercent:percentage,uploading:true})

	 	},(error)=>{
	 		//error
	 		console.log(error);
	 		this.setState({uploadPercent:0,uploading:false})
	 	},
	 	()=>{
	 		//complete
	 		this.setState({uploadPercent:0,uploading:false,profile:pCopy,dirty:true},this.saveChangesHandler)

	 	})


 }
 handlePTitleOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.Title){
 		pCopy.Title = value;
	 	const {authUser} = this.props;
	 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
  handlePTitleOnSave(){
 	this.saveChangesHandler();
 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.About){
 		pCopy.About = value;
	 	const {authUser} = this.props;
	 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
  handlePDescriptionOnSave(){
 	this.saveChangesHandler();
 }
  handleAgeOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.Age){
 		pCopy.Age = value;
	 	const {authUser} = this.props;
	 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
  handleAgeOnSave(){
 	this.saveChangesHandler();
 }
 handleDisplayNameOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.DisplayName){
 		pCopy.DisplayName = value;
	 	const {authUser} = this.props;
	 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
 handleDisplayNameOnSave(){
 	this.saveChangesHandler();
 }
 handleStatusOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.Status){
 		pCopy.Status = value;
 		this.setState({profile:pCopy,dirty:true});	
 	}
 	
 }
  handleStatusOnSave(){
 	this.saveChangesHandler();
 }
 handleNotesOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.Notes){
 		pCopy.Notes = value;
	 	const {authUser} = this.props;
	 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 }
  handleNotesOnSave(){
 	this.saveChangesHandler();
 }
 saveChangesHandler(event){
 	const {key} = this.props.match.params;
 	this.props.firebase.profile(key).set({
 		...this.state.profile
 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.setState({dirty:false})
 		})
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {untutorials,progress, loading, profile, tab} = this.state;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	var progressLevels = null;
 	if(!!progress && progress.length > 0)
 		progressLevels = groupBy(progress,'Level');
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
 	
 	//can edit

	return (
		<section id="profile">	
	 	  <div className="main">		
			<div className="sidebar">
				<div className={this.state.tab===TAB.PROFILE ? 'selected' : ''}>
				<h3 onClick={()=>this.setState({tab:TAB.PROFILE})}>Profile</h3>
				</div>
				<div className={this.state.tab===TAB.PROGRESS ? 'selected' : ''}>
					<h3 onClick={()=>this.setState({tab:TAB.PROGRESS})}>Projects</h3>
				</div>
				<div className={this.state.tab===TAB.UNTUTORIALS ? 'selected' : ''}>
					<h3 onClick={()=>this.setState({tab:TAB.UNTUTORIALS})}>Untutorials</h3>
				</div>
				{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
				<div className={this.state.tab===TAB.EMAIL ? 'selected' : ''}>
					<h3 onClick={()=>this.setState({tab:TAB.EMAIL})}>Email</h3>
				</div>
				)}
			</div>
			<div className="main-content">
				<div className="tabs">
				{(tab==TAB.PROFILE) && (
		  	  		<div className="tab profile">	
						<div className="avatar">
							{this.state.uploading && (
								<progress value={this.state.uploadPercent} max="100"/>
							)}
							{!!profile.ThumbnailFilename && !this.state.uploading &&(
								<LazyImage file={this.props.firebase.storage.ref('/public/' + profile.key + '/' + profile.ThumbnailFilename)}/>
							)}
							{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
								<label for="files" className="upload">
									<input id="files" type="file" onChange={this.handleThumbnailUpload}/>
								</label>
							)}
			 				</div>
							{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
							<>
								<div><strong>Login</strong><br/> {profile.Username}</div>
								<div><strong>Email</strong><br/> {profile.Email}</div>
							</>	
							)}
						<div>
						<h4>Display Name</h4>
						 <TCSEditor 
						 disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key))}
						className='display-name' 
						type='plain'
						onEditorChange={this.handleDisplayNameOnChange} 
						onEditorSave={this.handleDisplayNameOnSave} 
						placeholder={'Display Name'} 
						text={profile.DisplayName}/>
						</div>
			  		<div><h4>My Age</h4>
				<TCSEditor 
					disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key))}
					type='text'
					onEditorChange={this.handleAgeOnChange} 
					onEditorSave={this.handleAgeOnSave}
					placeholder={'I\'m ___ years old!'} 
					text={profile.Age}/></div>
					<div>
					<h4>About Me</h4>
				<TCSEditor 
					disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key))}
					className={'block'} 
					type='text'
					onEditorChange={this.handlePDescriptionOnChange} 
					onEditorSave={this.handlePDescriptionOnSave}
					placeholder={'About Me'} 
					text={profile.About}/>
					</div>
					<h4>Notes</h4>
					<TCSEditor 
					disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key))}
				type='text'
					onEditorChange={this.handleNotesOnChange} 
					onEditorSave={this.handleNotesOnSave}
					placeholder={'Notes'} 
					text={profile.Notes}/>
			  		</div>	
				)}
			  	{!!progress && Object.keys(progress).length > 0 && (
					<div className="tab progress">
		  	  	  		{(!tab || tab==TAB.PROGRESS) && (
		  	  	  			<div className="content tab-content">
		  	  	  				{Object.keys(progressLevels).map(group=>(
		  	  	  					<>
										<Accordion group={group} text = {
											progressLevels[group].map(project => (
											<div id={project.key}>
												<a href={project.URL}><h4 dangerouslySetInnerHTML={{__html:project.Title}}/></a>
												<div className="status">
													<h4 className={project.Status === 'APPROVED' ? 'green' : project.Status === 'PENDING' ? 'yellow' :'red'}></h4>
												</div>
												<a className="center" href={project.URL}><h4>View</h4></a>
											</div>
			  	  	  						))
							  			}/>	
									</>
								))}
							</div>
		  	  	  		)}
		  	  		</div>
		  		)}
		  	  	{!!untutorials && untutorials.length > 0 && (
					<div className="tab untutorials">
				  	{tab==TAB.UNTUTORIALS && (
				  	  	<div className="content tab-content">
							   <div className="title">
							   <h4>Title</h4>
							   <h4>Status</h4>
							   <h4>View</h4>
							   </div>
								{untutorials
									.sort()
									.filter(untutorial=>!!authUser.roles['ADMIN'] || authUser.uid===profile.key || untutorial.Status==='APPROVED')
									.map(untutorial => (
								  <div id={untutorial.key}>
									  <a href={ROUTES.LAUNCHPAD + '/'+  untutorial.key}><h4 dangerouslySetInnerHTML={{__html:untutorial.Title}}/></a>
									  <div className="center"><h4 className={untutorial.Status === 'APPROVED' ? 'green status' : 'yellow status'}></h4>{untutorial.Status}</div>
									  <a className="center" href={ROUTES.LAUNCHPAD + '/'+  untutorial.key}><h4>View</h4></a>
								</div>
							
							))}
							</div>
				  	)}
				</div>
		  	  	)}	
		  	    {!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
		  	  		<div className="tab email">
		  	  	  {tab==TAB.EMAIL && (
		  	  	  	<div className='content tab-content'>

						<EmailLoader label={profile.Username}/>
					</div>
		  	  	  )}

		  	  	</div>
		  	  	)}
		  	</div>
		</div>	
		</div>
	</section>	
	)
  }
}

class Accordion extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collapsed: false
		}
	}
	render() {
		const {collapsed} = this.state;
		return(
			<>
			<h3 className={collapsed? 'down' : 'up'} onClick={()=> this.setState({collapsed: !collapsed})}>Level {this.props.group}</h3>
			{!collapsed && (
				<>{this.props.text}</>
			)}
			</>
		)
	}
}

const ProfilePage = withFirebase(withAuthentication(ProfilePageBase));

export default ProfilePage;
