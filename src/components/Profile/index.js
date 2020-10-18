import React from 'react';
import LazyImage from '../LazyImage';
import EmailLoader from '../EmailLoader';
import { Link } from 'react-router-dom';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';
import gmailApi from 'react-gmail'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

 const TAB = {
 	PROJECTS:0,
 	UNTUTORIALS:1,
	 EMAIL:2,
	 PROFILE: 3,
	 PROGRESS:4
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
 		errors:{},
 		untutorials: [],
 		projects:[],
 		progresses:[],
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
 	this.handleAgeValidate = this.handleAgeValidate.bind(this);
 	this.handleAgeOnSave = this.handleAgeOnSave.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handleDisplayNameOnChange = this.handleDisplayNameOnChange.bind(this);
 	this.handleDisplayNameValidate = this.handleDisplayNameValidate.bind(this);
 	this.handleDisplayNameOnSave = this.handleDisplayNameOnSave.bind(this);
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handlePDescriptionValidate = this.handlePDescriptionValidate.bind(this);
 	this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);
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
 	var untuts = [];
 	var projects = [];
 	var progresses = [];
 	this.props.firebase.profile(key).on('value',snapshot => {

		var rawProf = snapshot.val();
		if(!rawProf.Notes)
		   rawProf.Notes='';
		
		this.props.firebase.untutorials().once('value',snapshot2 => {
			const {key} = this.props.match.params;
			const untutObj = snapshot2.val();
			const untutArr = Object.values(untutObj);

			untuts = untuts.concat(untutArr.filter(untutorial=>
				untutorial.Author==key
			));
			

			this.props.firebase.projects().once('value',snapshot3=>{
				var projArr = Object.values(snapshot3.val());
				projects = projects.concat(projArr.filter(project=>project.Author==key));
				this.props.firebase.progresses(key).once('value',snapshot=>{
					var progObj = snapshot.val();
					progresses = [];
					if(!!progObj){
						progresses = Object.values(snapshot.val());
						progresses.forEach((p,i)=>{
							progresses[i].Untutorial = untutObj[p.untut];
							progresses[i].Level = progresses[i].Untutorial.Level;
						})
					
					}
					
					this.setState({
						profile:rawProf,
						untutorials:untuts,
						projects:projects,
						progresses:progresses,
						loading:false,
					})
					
				})
				

			})
		});

	})

 	


 }
 componentWillUnmount(){
 	this.props.firebase.profile().off();
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
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.profile;
 	if(value !== pCopy.About){
 		pCopy.About = value;
	 	const {authUser} = this.props;
	 	if(!!authUser && !!authUser.roles['STUDENT'] && !(!!pCopy.roles['ADMIN']))
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true},this.handlePDescriptionValidate);
 	}
 	
 }
 handlePDescriptionValidate(){
 	const {errors,profile} = this.state;
 	const text = profile.About.replace(/<(.|\n)*?>/g, '').trim();
 	if(text.length == 0){
 		errors["About"] = 'ABOUT.<span class="red">ISREQUIRED</span>'; 
 	}
 	else if(text.length < 20){
 		errors["About"] = 'ABOUT.<span class="red">IS2SHORT</span>'; 
 	}
 	else delete errors["About"];
 	this.setState({errors:errors});
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
	 	this.setState({project:pCopy,dirty:true},this.handleAgeValidate);
 	}
 	
 }
 handleAgeValidate(){
 	const {errors} = this.state;
 	if(this.state.profile.Age.length == 0/* && isNaN(profile.Age)*/){
 		errors["Age"] = 'AGE.<span class="red">ISREQUIRED</span>'; 
 	}
 	else delete errors["Age"];
 	this.setState({errors:errors});
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
	 	this.setState({project:pCopy,dirty:true},this.handleDisplayNameValidate);
 	}
 	
 }
 handleDisplayNameValidate(){
 	const {errors,profile} = this.state;
 	if(profile.DisplayName.length == 0){
 		errors["Name"] = 'NAME.<span class="red">ISREQUIRED</span>'; 
 	}
 	else if(profile.DisplayName.length < 4){
 		errors["Name"] = 'NAME.<span class="red">IS2SHORT</span>'; 
 	}
 	else delete errors["Name"];
 	this.setState({errors:errors});
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
 	const {errors} = this.state;
 	const {key} = this.props.match.params;
 	if(Object.keys(errors).length == 0){
 		this.props.firebase.profile(key).set({
 			...this.state.profile
 		})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.setState({dirty:false})
 		})
 		.catch(error=>console.log(error));
 	}
 	else{
 		var badFields = Object.keys(errors);
		var messages = [];
		messages.push({
			html:`<span class="green">Saving</span>...`,
			type:true
		})
		messages.push({
			html:`<span class="red">ERROR!</span>`,
			type:false
		})
		for(var i =0;i< badFields.length;i++){

			messages.push({
				html:errors[badFields[i]],
				type:true
			});
		}

		messages.push({
			html:`Press any key to continue...`,
			type:false
		})

			
		
		
		this.props.setGlobalState({
			messages:messages,
			showMessage:true
			
		});
 	}
 	
 	console.log("Save Changes");
 }

 render(){
 	
 	const {untutorials,projects, loading, profile, progresses, tab} = this.state;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	var projectLevels = groupBy(projects,'Level');
 	var untutorialLevels = groupBy(untutorials,'Level');
 	var progressLevels = groupBy(progresses,'Level');

 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div className="loading">Loading ...</div>);
 	
 	//can edit

	return (
	<section id="profile">	
	  <div className="main">		
	    <div className="sidebar">
		<div className="sidebar-content">
		<div className={this.state.tab===TAB.PROFILE ? 'selected' : ''}>
		<h2 onClick={()=>this.setState({tab:TAB.PROFILE})}>Profile</h2>
		</div>
		<div className={this.state.tab===TAB.PROGRESS ? 'selected' : ''}>
			<h2 onClick={()=>this.setState({tab:TAB.PROGRESS})}>Recent Work</h2>
		</div>
		<div className={this.state.tab===TAB.PROJECTS ? 'selected' : ''}>
			<h2 onClick={()=>this.setState({tab:TAB.PROJECTS})}>Projects</h2>
		</div>
		<div className={this.state.tab===TAB.UNTUTORIALS ? 'selected' : ''}>
			<h2 onClick={()=>this.setState({tab:TAB.UNTUTORIALS})}>Untutorials</h2>
		</div>
		{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
		<div className={this.state.tab===TAB.EMAIL ? 'selected' : ''}>
			<h2 onClick={()=>this.setState({tab:TAB.EMAIL})}>Email</h2>
		</div>
		)}
	</div>
	</div>
	    <div className="main-content">
		  <div className="tabs">
			{(tab==TAB.PROFILE) && (
			  <div className="tab profile">	
					<div className="avatar">
						{this.state.uploading && (
							<progress value={this.state.uploadPercent} max="100"/>
						)}
						{!!profile.ThumbnailFilename && profile.ThumbnailFilename != '' && !this.state.uploading ? (
							<LazyImage id={profile.ThumbnailFilename} file={this.props.firebase.storage.ref('/public/' + profile.key + '/' + profile.ThumbnailFilename)}/>
						) : (
							<LazyImage file={this.props.firebase.storage.ref('/public/astronaut.png')}/>
						)}
						{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
							<label for="files" className="upload">
								<input id="files" type="file" onChange={this.handleThumbnailUpload}/>
							</label>
						)}
					</div>
					{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
						<>
							<div><h4>Login</h4>{profile.Username}</div>
							<div><h4>Email</h4>{profile.Email}</div>
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
					<div>
						<h4>My Age</h4>
						<TCSEditor 
							disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key))}
							type='text'
							onEditorChange={this.handleAgeOnChange} 
							onEditorSave={this.handleAgeOnSave}
							placeholder={'I\'m ___ years old!'} 
							text={profile.Age}/>
					</div>
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
				
					{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
						<>
							<h4>Notes</h4>
							<TCSEditor 
							disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key))}
							type='text'
							onEditorChange={this.handleNotesOnChange} 
							onEditorSave={this.handleNotesOnSave}
							placeholder={'Notes'} 
							text={profile.Notes}/>
						</>

					)}
				
				</div>	
			)}
			<div className="tab projects">
			  {(!tab || tab==TAB.PROJECTS) && (
			    <div className="content tab-content">
				  {projects.length < 1 && (
				    <p>{"No Projects Yet :("}</p>
				  )}
				  {Object.keys(projectLevels).map(group=>(
				    <>
				      <Accordion group={group} text={
					    projectLevels[group].map(project => (
						 <>
					      {project.Status === 'APPROVED' | (!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key)) ? (
					      <Link target="_blank" to={project.URL} id={project.key}>
						    <div dangerouslySetInnerHTML={{__html:project.Title}}/>
					        <div className="status">
							  {project.Status === 'APPROVED' ? 
							  <i className="fa fa-flag green"></i> :
							  <div>Draft</div>
							  }
					        </div>
				           <div className="center">View</div>
					    </Link>
					) : ""}
					</>))
				  } />	
				    </>
				))}
					</div>
			  )}
			</div>
			<div className="tab untutorials">
			  {(tab==TAB.UNTUTORIALS) && (
			    <div className="content tab-content">
				  {untutorials.length < 1 && (
				    <p>{"No Untutorials Yet :("}</p>
				  )}
				  {Object.keys(untutorialLevels).map(group=>(
				    <>
					<Accordion group={group} text = {
					  untutorialLevels[group].map(untutorial => (
					  <>
					  {untutorial.Status === 'APPROVED' | (!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key)) ? (
					    <Link id={untutorial.key} to={ROUTES.LAUNCHPAD + '/' + untutorial.key}>
						  <div dangerouslySetInnerHTML={{__html:untutorial.Title}}/>
						  <div className="center">View</div>
						  <div className="status">
							{untutorial.Status==="APPROVED" ?
							<i className="fa fa-flag green"></i> : 
							<div>Draft</div>
					      }    
					      </div>
					    
						</Link>
					  ) : ""}
					  </>))
					}/>	
					</>
				  ))}
				</div>
			  )}
			</div>
			<div className="tab progress">
			  {(tab==TAB.PROGRESS) && (
			    <div className="content tab-content">
				  {progresses.length < 1 && (
				    <p>{"No Progress Yet :("}</p>
				  )}
				  <div className="instructions">
				    <div><span class="fa fa-star white"></span> = to do</div>
					<div><span class="fa fa-star approved fa-spin"></span> = waiting for teacher to approve</div>
					<div><span class="fa fa-star approved"></span> = approved by teacher</div>

					<div className="complete"><img src='/images/roket.png'/> = you finished!</div>
				  </div>
				  {Object.keys(progressLevels).map(group=>(
				    <>
					  <Accordion group={group} text = {
					  progressLevels[group].sort(progress=>progress.LastModified).map(progress => (
					  <>
					    {!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===profile.key) && (
						  <Link id={progress.LastModified} to={ROUTES.LAUNCHPAD + '/' + progress.Untutorial.key + '?loadProgress=true'}>
						    <div dangerouslySetInnerHTML={{__html:progress.Untutorial.Title}}/>
							<div className="status">
							  {Object.keys(progress.Untutorial.steps).map(slot=>(  
							<>
							  {(!!progress.steps[slot] && progress.steps[slot].Status == 'DRAFT') ? (
								    <div class="fa fa-star white"></div>
								    // <img className={'pixel'} src='/images/rocket-coin-slot.png'/>
							          ) : (!!progress.steps[slot] && progress.steps[slot].Status == 'PENDING') ? (
								      <div class="fa fa-star approved fa-spin"></div>
								      // <img className={'pixel'} src='/images/inprogress-coin.gif'/>
							          ) : (
								     <div className="fa fa-star approved"></div>
								       // <img className={'pixel'} src='/images/rocket-coin.gif'/>
							    )}
                              </>
								))}
							</div>						
							{progress.Status == 'APPROVED' ? 									
							<div className="complete"><img src='/images/roket.png'/></div>:
							progress.Status == 'PENDING' ? 'Waiting for Teacher Approval' :
							!!progress.nextStep ? ('Work on Step ' + (progress.nextStep)) :
							'Work on Project'}
						 	</Link>
						
						  )}
					   </>
					   ))
					  }/>	
					</>
				  ))}
				</div>
			  )}
			</div>
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
