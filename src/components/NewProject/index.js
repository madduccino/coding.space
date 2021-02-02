import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';
import * as FILTERS from '../../constants/filter';



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
 		errors:{
			// "Thumbnail" : 'THUMBNAIL.<span class="red">ISREQUIRED</span>',
			"Title" : 'TITLE.<span class="red">ISREQUIRED</span>',
			"Step1" : 'STEP1.<span class="red">ISREQUIRED</span>',
			"Stepcount" : 'STEPS.<span class="red">R_REQUIRED</span>',
			"Description" : 'DESCRIPTION.<span class="red">ISREQUIRED</span>'

 		},
 		untutorial: {
 			key:uuidv4(),
 			Author:null,
 			Description:'',
 			Categories:{},
 			Level:1,
 			ThumbnailFilename:null,
 			Title:'',
 			Status:'DRAFT',
 			steps:[
 				{
 					Description:'',Title:''
 				}
 			]

 		},
 		valid:false,



 	}
 	//this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handleStepThumbnailUpload = this.handleStepThumbnailUpload.bind(this);
 	this.handleThumbnailValidate = this.handleThumbnailValidate.bind(this);
 	this.handlePTitleOnChange = this.handlePTitleOnChange.bind(this);
 	this.handlePTitleValidate = this.handlePTitleValidate.bind(this);
 	this.handlePTitleOnSave = this.handlePTitleOnSave.bind(this);
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handlePDescriptionValidate = this.handlePDescriptionValidate.bind(this);
 	this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);
 	this.handleLevelOnChange = this.handleLevelOnChange.bind(this);
 	this.handleLevelOnSave = this.handleLevelOnSave.bind(this);
 	this.handleStepTitleOnChange = this.handleStepTitleOnChange.bind(this);

 	this.handleStepOnChange = this.handleStepOnChange.bind(this);
 	this.handleStepValidate = this.handleStepValidate.bind(this);
 	this.handleStepOnSave = this.handleStepOnSave.bind(this);
 	this.addStepHandler = this.addStepHandler.bind(this);
 	this.deleteStepHandler = this.deleteStepHandler.bind(this);
 	this.handleStepCountValidate = this.handleStepCountValidate.bind(this);
 	this.handlePCategoryOnChange = this.handlePCategoryOnChange.bind(this);
	this.handleCategoryValidate = this.handleCategoryValidate.bind(this);
	this.handleCategoryOnClick = this.handleCategoryOnClick.bind(this);
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
 		this.setState({untutorial:pCopy},this.handlePTitleValidate);
 	}
 	
 }
 handlePTitleValidate(){
 	const {untutorial,errors} = this.state;
 	if(untutorial.Title.length == 0){
 		errors["Title"] = 'TITLE.<span class="red">ISREQUIRED</span>'; 		
 	}

 	else delete errors["Title"];
 	this.setState({errors:errors});

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
	 		this.setState({uploadPercent:0,uploading:false,untutorial:pCopy},this.handleThumbnailValidate)

	 	})


 }
 handleStepThumbnailUpload(event,step){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var pCopy = this.state.untutorial;
 	pCopy.steps[step].ThumbnailFilename = uuidv4() + '.' + ext;

 	var storageRef = this.props.firebase.storage.ref('/public/' + pCopy.Author + '/' + pCopy.steps[step].ThumbnailFilename);
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
 handleThumbnailValidate(){
 	const {untutorial,errors} = this.state;
	
 	if(untutorial.ThumbnailFilename.length == 0){
 		errors["Thumbnail"] = 'THUMBNAIL.<span class="red">ISREQUIRED</span>'; 		
 	}
 	
 	else delete errors["Thumbnail"];
 	this.setState({errors:errors});
 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.Description){
 		pCopy.Description = value;
 		this.setState({untutorial:pCopy},this.handlePDescriptionValidate);
 	}
 	
 }
 handlePDescriptionValidate(){
 	const {untutorial,errors} = this.state;
	const text = untutorial.Description.replace(/<(.|\n)*?>/g, '').trim();
 	if(text.length == 0){
 		errors["Description"] = 'DESCRIPTION.<span class="red">ISREQUIRED</span>'; 		
 	}

 	else delete errors["Description"];
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
 handleLevelOnSave(){

 }
 handleStepTitleOnChange(value,step){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.steps[step].Title){
 		pCopy.steps[step].Title = value;
 		this.setState({untutorial:pCopy},()=>this.handleStepValidate(pCopy.steps[step],step));
 	}

 }
 handleStepOnChange(value,step){
 	var pCopy = this.state.untutorial;
 	if(value !== pCopy.steps[step].Description){
 		pCopy.steps[step].Description = value;
 		this.setState({untutorial:pCopy},()=>this.handleStepValidate(pCopy.steps[step],step));
 	}

 }
 handleStepValidate(step,index){
 	const {errors} = this.state;
 	if(step.Description.length==0){
 		errors["Step"+index] = 'STEP' +index+'.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(step.Description.length < 20){
 		errors["Step"+index] = 'STEP' +index+'.<span class="red">ISTOOSHORT</span>'; 		
 	}
 	else delete errors["Step"+index];
 	this.setState({errors:errors})
 }
 handleStepOnSave(){

 }
 deleteStepHandler(event,key){
 	var pCopy = this.state.untutorial;
 	delete pCopy.steps[key];
 	this.setState({untutorial:pCopy},this.handleStepCountValidate);
 	console.log("Delete Step");
 	console.log(key);
 }
 addStepHandler(event){
 	var pCopy = this.state.untutorial;
 	var step = {Description:'',Title:''};
 	var index = pCopy.steps.length;
 	pCopy.steps.push(step);
 	this.setState({untutorial:pCopy},()=>{this.handleStepCountValidate();this.handleStepValidate(step,index)});
 	console.log("Add Step");
 }
 handleStepCountValidate(){
 	const {errors,untutorial} = this.state;
 	if(untutorial.steps.length == 0){
		errors["Stepcount"] = 'STEPS.<span class="red">R_REQUIRED</span>'; 		
 	}
 	else if(untutorial.steps.length < -3/*disabled*/){
		errors["Stepcount"] = 'STEPS.<span class="red">R_2SHORT</span>'; 		
 	}
 	else delete errors["Stepcount"];
 	this.setState({errors:errors});
 }
 handlePCategoryOnChange(event){
 	const {untutorial} = this.state;
 	if(event.target.value != '-1'){
 		untutorial.Categories[event.target.value] = event.target.value;
 		this.setState({untutorial:untutorial},this.handleCategoryValidate);	
 	}
 	
 }
 handleCategoryOnClick(text){
 	const {untutorial} = this.state;
 	delete untutorial.Categories[text];
 	this.setState({untutorial:untutorial},this.handleCategoryValidate);

 }
 handleCategoryValidate(){
 	const {untutorial,errors} = this.state;
 	if(Object.keys(untutorial.Categories).length < 1){
 		errors["Categories"] = 'CATS.<span class="red">At least 1 category required.</span>';
 	}
 	else
 		delete errors["Categories"];
 	this.setState({errors:errors});
 }
 saveChangesHandler(event){
 	const {errors} = this.state;
 	if(Object.keys(errors).length == 0){
 		this.state.untutorialRef.set({
 			...this.state.untutorial
 		})
 		.then(()=>{
			 console.log("Successfully Saved");
 			this.props.history.push(ROUTES.LAUNCHPAD +'/' + this.state.untutorial.key);
 		})
 		.catch(error=>console.log(error));
 	}
 	else {
		 var badFields = Object.keys(errors);
		 console.log(badFields)
		var messages = [];
		// messages.push({
		// 	html:`<span class="green">Saving</span>...`,
		// 	type:true
		// })
		// messages.push({
		// 	html:`<span class="red">ERROR!</span>`,
		// 	type:false
		// })
		// for(var i =0;i< badFields.length;i++){

		// 	messages.push({
		// 		html:errors[badFields[i]],
		// 		type:true
		// 	});
		// }

		// messages.push({
		// 	html:`Press any key to continue...`,
		// 	type:false
		// })

			
		
		
		// this.props.setGlobalState({
		// 	messages:messages,
		// 	showMessage:true
			
		// });
 	}
 	
 	console.log("Save Changes");
 }

 render(){
 	
 	const {untutorial, loading} = this.state;
 	const {Title,Description,Level, steps} = untutorial;
 	const {authUser} = this.props;
 	const stepCount = Object.keys(untutorial.steps).length;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div className="loading">Loading ...</div>);
	
	return (
	  <section id="new-project">
	    <div className="main">
		  <div className="toolbar">
		    <button onClick={this.addStepHandler}>Add Step</button>
		    <button onClick={this.saveChangesHandler}>Save</button> 
		  </div> 	
          <div className="main-content"> 
		    <div className="steps"> 
		     {Object.keys(untutorial.steps).map(step => (
			    <div className="step">
				  <div className={'step-title status'}>
				    Step {parseInt(step)+1}
					{!!untutorial.steps[step] && !!untutorial.steps[step].Title.length && (
						<>:&nbsp;</>
					)}
				    <TCSEditor
				    disabled={false}
				    type={'plain'}
				    className={'editor header'}
				    onEditorChange={(value)=>this.handleStepTitleOnChange(value,step)} 
				    onEditorSave={this.handleStepOnSave} 
				    placeholder={'Step Title'}
				    buttonText={untutorial.steps[step].Title.length > 0 ? 'Edit' : '+'} 
				    text={!!untutorial.steps[step].Title ? untutorial.steps[step].Title : ""}/>  
					</div>
					<div className="step-content">
					<TCSEditor 
						disabled={false}
						onEditorChange={(value)=>this.handleStepOnChange(value,step)} 
						onEditorSave={this.handleStepOnSave}
						placeholder={'Step Description'} 
						buttonText={untutorial.steps[step].Description.length > 0 ? 'Edit Description' : 'Add Description'}
						text={untutorial.steps[step].Description}/>
					</div>
					{stepCount > 1 && (
						<button className="delete" onClick={(event)=>this.deleteStepHandler(event,step)}>Delete</button>
					)}
				
					<div className="thumbnail">
						{this.state.uploading && (
							<progress value={this.state.uploadPercent} max="100"/>
						)}
						<p className={!!untutorial.steps[step].ThumbnailFilename ? 
							"change" : "add"}>{!!untutorial.steps[step].ThumbnailFilename ? 
							"Update Screenshot" : "+ Add Screenshot"}</p>
					
						{!!untutorial.steps[step].ThumbnailFilename && untutorial.steps[step].ThumbnailFilename!=='' && !this.state.uploading &&(
							<LazyImage file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.steps[step].ThumbnailFilename)}/>
						)}
						<label for={'step' + step + '-thumbnail-upload'} className={!!untutorial.steps[step].ThumbnailFilename ? "replace" : "upload replace"}>
							<input id={'step' + step + '-thumbnail-upload'} type="file" onChange={(event)=>{this.handleStepThumbnailUpload(event,step)}}/>
						</label>
					</div>
				</div>
			  ))}
			  </div>
		  </div>
		  <div className="sidebar">
		    <div className={'container'}>
			  <h4>Title</h4>
				<TCSEditor 
				disabled={false}
				type='plain'
				onEditorChange={this.handlePTitleOnChange} 
				onEditorSave={this.handlePTitleOnSave}
				placeholder={'Untutorial Title'} 
				buttonText={untutorial.Title.length > 0 ? "Edit" : "Add"}
				text={untutorial.Title}/>
			</div>
		    <div className={'container'}>
				<h4>Description</h4>
				<TCSEditor 
					disabled={false}
					type='text'
					onEditorChange={this.handlePDescriptionOnChange} 
					onEditorSave={this.handlePDescriptionOnSave}
					placeholder={'Project Description'} 
					buttonText={untutorial.Description.length > 0 ? "Edit" : "Add"}
					text={untutorial.Description}/>
			</div>
            <div className="container">
		      <h4>Level</h4>
		      <TCSEditor 
			  disabled={false}
			  type='select'
			  selectOptions={[1,2,3,4,5,6]}
			  onEditorChange={this.handleLevelOnChange} 
			  onEditorSave={this.handleLevelOnSave}
			  text={untutorial.Level}/>	
            </div>
            <div className="container tags">
              <h4>Tags</h4>
              <div className="filter">
                {Object.keys(untutorial.Categories).length != Object.keys(FILTERS).length && (
		          <select onChange={this.handlePCategoryOnChange}>
		            <option value='-1'>-------</option>
			        {Object.keys(FILTERS).filter(f=>!Object.keys(untutorial.Categories).includes(f)).map(catName=><option value={catName}>{FILTERS[catName]}</option>)}
		        </select>
	            )}
               </div>
              {Object.keys(untutorial.Categories).length > 0 && (
              <div className="filter-categories">
	            {Object.keys(untutorial.Categories).map(f=>(
		          <a onClick={()=>this.handleCategoryOnClick(f)}>{FILTERS[f]}</a>
	            ))}
               </div>
              )}
            </div>
            <div className="container">
              <div className="thumbnail">
                <h4>{untutorial.ThumbnailFilename && !this.state.uploading ? '+Replace' : '+ Add'} Image</h4>
                {this.state.uploading && (
	             <progress value={this.state.uploadPercent} max="100"/>
               )}
              {!!untutorial.ThumbnailFilename && untutorial.ThumbnailFilename!=='' && !this.state.uploading &&(
	            <LazyImage file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename)}/>
              )}
              <label for="files" className="upload">
	            <input id="files" type="file" onChange={this.handleThumbnailUpload}/>
              </label>
              </div>
            </div>
		  </div> 
		</div>
	  </section>	
	)
  }
}

const NewProjectPage = withFirebase(withAuthentication(NewProjectPageBase));

export default NewProjectPage;