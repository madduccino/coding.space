import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';



class NewProjectPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		author:null,
 		loading:true,
 		uploading:false,
 		uploadPercent:0,
 		projectRef:null,
 		project: {
 			key:uuidv4(),
 			Author:null,
 			Description:'',
 			Level:1,
 			ThumbnailFilename:null,
 			Title:'',
 			Status:'DRAFT',
 			steps:{
 				1:{
 					Description:'',
 				}
 			}

 		},
 		valid:false,



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


 	this.setState({
 		projectRef: this.props.firebase.project(this.state.project.key),

 		
 	})


 }
 componentWillReceiveProps(props){
 	if(this.state.project.Author != props.authUser.key){
 		var pCopy = this.state.project;
 		pCopy.Author = props.authUser.key;
 		this.setState({ 
 			project: pCopy,
 			loading:false,

 		})
 	}
 		
 }
 onChange = event => {
    
  	this.setState({ [event.target.name]: event.target.value });
    

 };
 componentWillUnmount(){
 	this.props.firebase.project().off();
 }
  handlePTitleOnChange(value){
 	var pCopy = this.state.project;
 	pCopy.Title = value;
 	this.setState({project:pCopy});
 }
 handleThumbnailUpload(event){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var pCopy = this.state.project;
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
	 		this.setState({uploadPercent:0,uploading:false,project:pCopy})

	 	})


 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.project;
 	pCopy.Description = value;
 	this.setState({project:pCopy});
 }
 handleLevelOnChange(event){
 	var pCopy = this.state.project;
 	pCopy.Level = event.target.value;
 	this.setState({project:pCopy});
 }
 handleStepOnChange(value,step){
 	var pCopy = this.state.project;
 	pCopy.steps[step].Description = value;
 	this.setState({project:pCopy});
 }
 deleteStepHandler(event,key){
 	var pCopy = this.state.project;
 	delete pCopy.steps[key];
 	this.setState({project:pCopy});
 	console.log("Delete Step");
 	console.log(key);
 }
 addStepHandler(event){
 	var pCopy = this.state.project;
 	pCopy.steps[Math.max(...Object.keys(pCopy.steps)) + 1] = {Description:''};
 	this.setState({project:pCopy});
 	console.log("Add Step");
 }
 saveChangesHandler(event){

 	this.state.projectRef.set({
 		...this.state.project
 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.props.history.push("/projects/" + this.state.project.key);
 		})
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {project, loading} = this.state;
 	const {Title,Description,Level, steps} = project;
 	const {authUser} = this.props;
 	const stepCount = Object.keys(project.steps).length;
 	
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
	return (
		<div>
			<h1>New Project</h1>
			<div className={'container'}>
				<TCSEditor onEditorChange={this.handlePTitleOnChange} placeholder={'Project Title'} text={project.Title}/>
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
 					<h4>Level</h4>
 				</div>
			<div className={'container'}>
				<select value={Level} onChange={this.handleLevelOnChange}>
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="6">6</option>
				</select>
				
			</div>
			<h3>Steps</h3>
			<div className={'container'}>
				{Object.keys(project.steps).map(step => (
					<div>
					<TCSEditor onEditorChange={(value)=>this.handleStepOnChange(value,step)} placeholder={'Step Description'} text={project.steps[step].Description}/>
					{stepCount > 1 && (
						<button  onClick={(event)=>this.deleteStepHandler(event,step)}>Delete Step</button>
					)}
				</div>
			))}
			</div>
			<button onClick={this.addStepHandler}>Add Step</button>
			<button disabled={isInvalid} onClick={this.saveChangesHandler}>Save Changes</button>
		</div>
	)



 	
	}
}


const NewProjectPage = withFirebase(withAuthentication(NewProjectPageBase));

export default NewProjectPage;