import React from 'react';
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
 		errors:{},
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
 	this.validatePTitle = this.validatePTitle.bind(this);
 	this.handlePTitleOnSave = this.handlePTitleOnSave.bind(this);

 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.validatePDescription = this.validatePDescription.bind(this);
 	this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);

 	this.handleLevelOnChange = this.handleLevelOnChange.bind(this);
 	this.validateLevel = this.validateLevel.bind(this);
 	this.handleLevelOnSave = this.handleLevelOnSave.bind(this);
 	this.handleStepOnChange = this.handleStepOnChange.bind(this);
 	this.validateStep = this.validateStep.bind(this);
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
 	document.body.addEventListener('click', this.handleClick);
 	this.setState({
 		untutorialRef: this.props.firebase.untutorial(this.state.untutorial.key),
 		untutorial:pCopy,
 		loading:false,	
 	})

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
	 document.body.removeEventListener('click', this.handleClick);
 }
  handlePTitleOnChange(value){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.Title){
 		pCopy.Title = value;
 		this.setState({untutorial:pCopy});
 		this.validatePTitle();
 	}
 }
 validatePTitle(){
 	const {untutorial,errors} = this.state;
 	const {authUser} = this.props;
 	if(untutorial.Title===''){
 		errors['UNTUTORIAL_TITLE'] = 'UNTUTORIAL_TITLE.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(untutorial.Title.length < 10){

		errors['UNTUTORIAL_TITLE'] = 'UNTUTORIAL_TITLE.<span class="red">ISTOOSHORT</span>';
	}
 	else{
 		delete errors['UNTUTORIAL_TITLE'];
 	}
 	this.setState({errors:errors});
 }
 handlePTitleOnSave(){
   //console.log('hello')
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
 validatePDescription(){
 	const {untutorial,errors} = this.state;
 	const {authUser} = this.props;
 	
 	
 	if(untutorial.Description===''){
 		errors['UNTUTORIAL_DESCRIPTION'] = 'UNTUTORIAL_DESCRIPTION.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(untutorial.Description.length < 20){

		errors['UNTUTORIAL_DESCRIPTION'] = 'UNTUTORIAL_DESCRIPTION.<span class="red">ISTOOSHORT</span>';
	}
 	else{
 		delete errors['UNTUTORIAL_DESCRIPTION'];
 	}
 	this.setState({errors:errors});
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
 validateLevel(){
 	const {untutorial,errors} = this.state;
 	const {Level} = untutorial;
 	if(isNaN(Level)){
		errors['LEVEL'] = 'LEVEL.<span class="red">ISINVALID</span>'; 		
 	}
 	if(![1,2,3,4,5,6].includes(Level)){

 		errors['LEVEL'] = 'LEVEL.<span class="red">ISOUTSIDERANGE</span>';
 	}
 	else{
 		delete errors['LEVEL'];
 	}
 	this.setState({errors:errors});
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
 validateStep(index){
 	const {untutorial,errors} = this.state;
	const Step = untutorial.steps[index];
	const text = Step.Description.replace(/<(.|\n)*?>/g, '').trim();
	if(text===''){
	errors['STEP'+index] = 'STEP.<span class="orange">'+index+'</span>.<span class="red">ISREQUIRED</span>'; 		
	}
	if(text.length < 20){

		errors['STEP'+index] = 'STEP.<span class="orange">'+index+'</span>.<span class="red">ISTOOSHORT</span>';
	}
	else{
		delete errors['STEP' + index];
	}
	this.setState({errors:errors});
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
 	
 	const {untutorial, loading, errors} = this.state;
 	const {Title,Description, Level, steps} = untutorial;
 	const {authUser} = this.props;

 	const stepCount = (!!untutorial&& !!untutorial.steps) ? Object.keys(untutorial.steps).length : 0;
	
 	if(Object.values(errors).length === 0){
 		untutorial.LastModified = Date.now();
 		untutorial.Author = authUser.key;
 		this.props.firebase.untutorial(untutorial.key).set({
	 		...untutorial
	 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.props.history.push(ROUTES.LAUNCHPAD + '/' + this.state.untutorial.key);

 			/*this.props.setGlobalState({
 				messages:[{

 					html:`SAVE.<span class="green">GOOD</span>`,
 					type:true},{

 					html:`Press any key to continue...`,
 					type:false,

 					}],
 				showMessage:true
 			});*/
 		})
 		.catch(error=>console.log(error));
 	}
 	else{
 		var badFields = Object.keys(errors);
 		var messages = [];
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
 handleClick = (e) => {

	if(e.target.className=="gear") {
		console.log('yo')
	  this.setState({dropdown: !this.dropdown})
	} else {
	  this.setState({dropdown: !this.dropdown})
		}
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
	  <section id="new-project">
		<div className="main">
			<div className="sidebar">
			  <div className={'container'}>
			     <h4>Untutorial Title</h4>	
				  <div>
					<TCSEditor 
					disabled={false}
					type='plain'
					onEditorChange={this.handlePTitleOnChange} 
					onEditorSave={this.handlePTitleOnSave}
					placeholder={'Untutorial Title'} 
					text={untutorial.Title}/>
			      </div>
			   <div>
			    <h4>Add Thumbnail</h4>
				<div className="avatar">

				<input type="file" onChange={this.handleThumbnailUpload}/>
					{this.state.uploading && (
					<progress value={this.state.uploadPercent} max="100"/>
				)}
				{!!untutorial.ThumbnailFilename && untutorial.ThumbnailFilename!=='' && !this.state.uploading &&(
					<LazyImage file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename)}/>
				)}				
			</div>
			</div>
			<h4>Untutorial Description</h4>
			<div>
				<TCSEditor 
					disabled={false}
					type='text'
					onEditorChange={this.handlePDescriptionOnChange} 
					onEditorSave={this.handlePDescriptionOnSave}
					placeholder={'Untutorial Description'} 
					text={untutorial.Description}/>
			</div>
			<h4>Level</h4>
			<div>
				<TCSEditor 
					disabled={false}
					type='select'
					selectOptions={[1,2,3,4,5,6]}
					onEditorChange={this.handleLevelOnChange} 
					onEditorSave={this.handleLevelOnSave}
					text={untutorial.Level}/>	
			 </div>
            </div>
           </div>

			<div className="content">
					<h1>New Untutorial
				    <button onClick={this.saveChangesHandler}>Save</button>

					</h1>
				{Object.keys(untutorial.steps).map(step => (
					<div className="step">
					<TCSEditor 
						disabled={false}
						onEditorChange={(value)=>this.handleStepOnChange(value,step)} 
						onEditorSave={this.handleStepOnSave}
						placeholder={'Step Description'} 
						text={untutorial.steps[step].Description}
						addStepHandler={this.addStepHandler}
						stepCount={stepCount}
						step={step}
						type='steparoo'		
						deleteSteppedy={(event,step)=>this.deleteStepHandler(event,step)}
						/>
				</div>
			))}
						<button onClick={this.handleSave}>Save My Work</button>

			</div>
			</div>
			
			
	
	  </section>	
	)



 	
	}
}

const NewProjectPage = withFirebase(withAuthentication(NewProjectPageBase));

export default NewProjectPage;