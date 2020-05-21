import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';


class ProjectPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		author:null,
 		loading:true,
 		project: {},
 		dirty:false,
 		uploading:false,
 		uploadPercent:0,



 	}
 	this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handlePTitleOnChange = this.handlePTitleOnChange.bind(this);
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handleLevelOnChange = this.handleLevelOnChange.bind(this);
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

 	this.props.firebase.project(key).on('value', snapshot => {
 		const project = snapshot.val();
 		this.props.firebase.profile(project.Author).once('value')
 			.then(snapshot2 => {
 				const prof = snapshot2.val();
 				this.setState({
		 			project: project,
		 			author:prof,
		 			loading:false,
		 		})
 			})
 		

 		

 		
 	})


 }

 componentWillUnmount(){
 	//this.props.firebase.proj().off();
 	this.props.firebase.project().off();
 }
 handleThumbnailUpload(event){
 	
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var pCopy = this.state.project;
 	const {authUser} = this.props;
 	if(authUser && !!authUser.roles['STUDENT'])
 		pCopy.Status = 'DRAFT';
 	pCopy.ThumbnailFilename = uuidv4() + '.' + ext;

 	var storageRef = this.props.firebase.storage.ref('/public/' + pCopy.Author + '/' + pCopy.ThumbnailFilename);
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
	 		this.setState({uploadPercent:0,uploading:false,project:pCopy,dirty:true})

	 	})


 }
 handlePTitleOnChange(value){
 	var pCopy = this.state.project;
 	if(value !== pCopy.Title){
 		pCopy.Title = value;
	 	const {authUser} = this.props;
	 	if(authUser && !!authUser.roles['STUDENT'])
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.project;
 	if(value !== pCopy.Description){
 		pCopy.Description = value;
	 	const {authUser} = this.props;
	 	if(authUser && !!authUser.roles['STUDENT'])
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
 handleStatusOnChange(event){
 	var pCopy = this.state.project;
 	if(event.target.value !== pCopy.Status){
 		pCopy.Status = event.target.value;
 		this.setState({project:pCopy,dirty:true});
 	}
 	
 }
 handleLevelOnChange(event){
 	var pCopy = this.state.project;
 	if(event.target.value !== pCopy.Level){
 		pCopy.Level = event.target.value;
	 	const {authUser} = this.props;
	 	if(authUser && !!authUser.roles['STUDENT'])
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
 handleStepOnChange(value,step){
 	var pCopy = this.state.project;
 	if(value !== pCopy.steps[step].Description){
 		pCopy.steps[step].Description = value;
	 	const {authUser} = this.props;
	 	if(authUser && !!authUser.roles['STUDENT'])
	 		pCopy.Status = 'DRAFT';
	 	this.setState({project:pCopy,dirty:true});
 	}
 	
 }
 deleteStepHandler(event,key){
 	var pCopy = this.state.project;
 	const {authUser} = this.props;
 	if(authUser && !!authUser.roles['STUDENT'])
 		pCopy.Status = 'DRAFT';
 	delete pCopy.steps[key];
 	this.setState({project:pCopy,dirty:true});
 	console.log("Delete Step");
 	console.log(key);
 }
 addStepHandler(event){
 	var pCopy = this.state.project;
 	const {authUser} = this.props;
 	if(authUser && !!authUser.roles['STUDENT'])
 		pCopy.Status = 'DRAFT';
 	pCopy.steps[Math.max(...Object.keys(pCopy.steps)) + 1] = {Description:''};
 	this.setState({project:pCopy,dirty:true});
 	console.log("Add Step");
 }
 saveChangesHandler(event){
 	const {key} = this.props.match.params;

 	this.props.firebase.project(key).set({
 		...this.state.project
 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.setState({dirty:false})
 		})
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {project, loading, author} = this.state;
 	const {Title,Description, Level, steps} = project;
 	const {authUser} = this.props;
 	const stepCount = (!!project&& !!project.steps) ? Object.keys(project.steps).length : 0;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
 	var isInvalid =
      Title === '' ||
      Description === '' ||
      isNaN(Level) ||
      stepCount < 1;
     for(var step in steps)
     	if(step.Description === '')
     		isInvalid = true;
 	//can edit

	if(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===project.Author) )
 	{
 		return (
 			<div>
 				<h1 dangerouslySetInnerHTML={{__html:project.Title}}/>
 				<div className={'container'}>
	 				<h3>by: <a href={'/profile/' + project.Author}>{author.DisplayName}</a></h3>
	 				{authUser && !!authUser.roles['ADMIN'] && (
	 					<select value={project.Status} onChange={this.handleStatusOnChange}>
	 						<option value="DRAFT">DRAFT</option>
	 						<option value="APPROVED">APPROVED</option>
	 					</select>

	 				)}
 				</div>
 				<div className={'container'}>
					<h4>Thumbnail</h4>
				</div>
				<div className={'container'}>
					<input type="file" onChange={this.handleThumbnailUpload}/>
					{this.state.uploading && (
						<progress value={this.state.uploadPercent} max="100"/>
					)}
					{!!project.ThumbnailFilename && !this.state.uploading &&(
						<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
					)}
					
				</div>
 				<div className={'container'}>
 					<TCSEditor onEditorChange={this.handlePDescriptionOnChange} placeholder={'Project Description'} text={project.Description}/>
 				</div>
 				<div className={'container'}>
 					<h3>Level</h3>
 				</div>
 				<div className={'container'}>
					<select value={project.Level} onChange={this.handleLevelOnChange}>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
					</select>
					
				</div>
 				<div className={'container'}>
 					{Object.keys(project.steps).map(step => (
 						<div>
							<TCSEditor onEditorChange={(value)=>this.handleStepOnChange(value,step)} placeholder={'Step Description'} text={project.steps[step].Description}/>
							<button  onClick={(event)=>this.deleteStepHandler(event,step)}>Delete Step</button>
						</div>
					))}
 				</div>
 				<button onClick={this.addStepHandler}>Add Step</button>
 				{this.state.dirty && (
 					<button onClick={this.saveChangesHandler}>Save Changes</button>
 				)}
 				
 			</div>
 		)

 	}

 	return (
			<div>
	 			<h1 dangerouslySetInnerHTML={{__html:project.Title}}/>
	 			<div className={'container'}>
	 				<h3>by: <a href={'/profile/' + project.Author}>{author.DisplayName}</a></h3>
	 				{!!author && !!author.ThumbnailFilename &&(
						<LazyImage file={this.props.firebase.storage.ref('/public/' + author.key + '/' + author.ThumbnailFilename)}/>
					)}
	 			</div>
				<div className={'container'} dangerouslySetInnerHTML={{__html:project.Description}}/>
				<div className={'container'}>
					{Object.keys(project.steps).map(step => (
						<div class="block" dangerouslySetInnerHTML={{__html:project.steps[step].Description}}/>
					))}
				</div>

			</div>
 		)
}
}


const ProjectPage = withFirebase(withAuthentication(ProjectPageBase));

export default ProjectPage;