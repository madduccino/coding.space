import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';



class NewProjectPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		author:null,
 		loading:true,
 		uploading:false,
 		uploadPercent:0,
 		untutorialRef:null,
 		untutorial: {
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
 	//this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handlePTitleOnChange = this.handlePTitleOnChange.bind(this);
 	this.handlePTitleOnSave = this.handlePTitleOnSave.bind(this);
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);
 	this.handleLevelOnChange = this.handleLevelOnChange.bind(this);
 	this.handleLevelOnSave = this.handleLevelOnSave.bind(this);
 	this.handleStepOnChange = this.handleStepOnChange.bind(this);
 	this.handleStepOnSave = this.handleStepOnSave.bind(this);
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
 	var pCopy = this.state.untutorial;
 	if(this.props.authUser){
		pCopy.Author = this.props.authUser.key;

	 	this.setState({
	 		untutorialRef: this.props.firebase.untutorial(this.state.untutorial.key),
	 		untutorial:pCopy,
	 		loading:false,


	 		
	 	})

 	}
 	


 }
 componentWillReceiveProps(props){
 	if(this.state.untutorial.Author != props.authUser.key){
 		var pCopy = this.state.untutorial;
 		pCopy.Author = props.authUser.key;
 		this.setState({ 
 			untutorial: pCopy,
 			loading:false,

 		})
 	}
 		
 }
 onChange = event => {
    
  	this.setState({ [event.target.name]: event.target.value });
    

 };
 componentWillUnmount(){
 	this.props.firebase.untutorial().off();
 }
  handlePTitleOnChange(value){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.Title){
 		pCopy.Title = value;
 		this.setState({untutorial:pCopy});
 	}
 	
 }
 handlePTitleOnSave(){

 }
 handleThumbnailUpload(event){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var pCopy = this.state.untutorial;
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
	 		this.setState({uploadPercent:0,uploading:false,untutorial:pCopy})

	 	})


 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.Description){
 		pCopy.Description = value;
 		this.setState({untutorial:pCopy});
 	}
 	
 }
 handlePDescriptionOnSave(){

 }
 handleLevelOnChange(value){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.Level){
 		pCopy.Level = value;
 		this.setState({untutorial:pCopy});
 	}
 	
 }
 handleLevelOnSave(){

 }
 handleStepOnChange(value,step){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.steps[step].Description){
 		pCopy.steps[step].Description = value;
 		this.setState({untutorial:pCopy});
 	}

 }
 handleStepOnSave(){

 }
 deleteStepHandler(event,key){
 	var pCopy = this.state.untutorial;
 	delete pCopy.steps[key];
 	this.setState({untutorial:pCopy});
 	console.log("Delete Step");
 	console.log(key);
 }
 addStepHandler(event){
 	var pCopy = this.state.untutorial;
 	pCopy.steps[Math.max(...Object.keys(pCopy.steps)) + 1] = {Description:''};
 	this.setState({untutorial:pCopy});
 	console.log("Add Step");
 }
 saveChangesHandler(event){

 	this.state.untutorialRef.set({
 		...this.state.untutorial
 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.props.history.push(ROUTES.LAUNCHPAD + this.state.untutorial.key);
 		})
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {untutorial, loading} = this.state;
 	const {Title,Description,Level, steps} = untutorial;
 	const {authUser} = this.props;
 	const stepCount = Object.keys(untutorial.steps).length;
 	
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
			<h1>New Untutorial</h1>
			<div className={'container'}>
				<TCSEditor 
					disabled={false}
					type='plain'
					onEditorChange={this.handlePTitleOnChange} 
					onEditorSave={this.handlePTitleOnSave}
					placeholder={'Untutorial Title'} 
					text={untutorial.Title}/>
			</div>
			<div className={'container'}>
				<h4>Thumbnail</h4>
			</div>
			<div className={'container'}>
				<input type="file" onChange={this.handleThumbnailUpload}/>
				{this.state.uploading && (
					<progress value={this.state.uploadPercent} max="100"/>
				)}
				{!!untutorial.ThumbnailFilename && untutorial.ThumbnailFilename!=='' && !this.state.uploading &&(
					<LazyImage file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename)}/>
				)}
				
			</div>
			
			
			<div className={'container'}>
				<TCSEditor 
					disabled={false}
					type='text'
					onEditorChange={this.handlePDescriptionOnChange} 
					onEditorSave={this.handlePDescriptionOnSave}
					placeholder={'Project Description'} 
					text={untutorial.Description}/>
			</div>
			<div className={'container'}>
 					<h4>Level</h4>
 				</div>
			<div className={'container'}>
				<TCSEditor 
					disabled={false}
					type='select'
					selectOptions={[1,2,3,4,5,6]}
					onEditorChange={this.handleLevelOnChange} 
					onEditorSave={this.handleLevelOnSave}
					text={untutorial.Level}/>
				
			</div>
			<h3>Steps</h3>
			<div className={'container'}>
				{Object.keys(untutorial.steps).map(step => (
					<div>
					<TCSEditor 
						disabled={false}
						onEditorChange={(value)=>this.handleStepOnChange(value,step)} 
						onEditorSave={this.handleStepOnSave}
						placeholder={'Step Description'} 
						text={untutorial.steps[step].Description}/>
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