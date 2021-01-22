import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthorization} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROLES from '../../constants/roles';



class NewClassPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		uploading:false,
 		uploadPercent:0,
 		classRef:null,
 		Author:null,
 		errors:{
 			"Title" : 'TITLE.<span class="red">ISREQUIRED</span>',
 			"Schedule" : 'SCHEDULE.<span class="red">ISREQUIRED</span>',
 			"Location" : 'LOCATION.<span class="red">ISREQUIRED</span>',
 			"Description" : 'DESCRIPTION.<span class="red">ISREQUIRED</span>',
 			"Thumbnail" : 'THUMBNAIL.<span class="red">ISREQUIRED</span>'		

 		},
 		clazz: {
 			key:uuidv4(),
 			Description:'',
 			Schedule:'',
 			ThumbnailFilename:null,
 			Title:'',
 			Status:'DRAFT',
 			Location:'',
 			Members:{},
 		},

 		
 		valid:false,



 	}
 	//this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handleThumbnailValidate = this.handleThumbnailValidate.bind(this);
 	this.handleClassTitleOnChange = this.handleClassTitleOnChange.bind(this);
 	this.handleClassTitleValidate = this.handleClassTitleValidate.bind(this);
 	this.handleClassTitleOnSave = this.handleClassTitleOnSave.bind(this);
 	this.handleClassDescriptionOnChange = this.handleClassDescriptionOnChange.bind(this);
 	this.handleClassDescriptionValidate = this.handleClassDescriptionValidate.bind(this);
 	this.handleClassDescriptionOnSave = this.handleClassDescriptionOnSave.bind(this);
 	this.handleClassScheduleOnChange = this.handleClassScheduleOnChange.bind(this);
 	this.handleClassScheduleValidate = this.handleClassScheduleValidate.bind(this);
 	this.handleClassScheduleOnSave = this.handleClassScheduleOnSave.bind(this);
 	this.handleClassLocationOnChange = this.handleClassLocationOnChange.bind(this);
 	this.handleClassLocationValidate = this.handleClassLocationValidate.bind(this);
 	this.handleClassLocationOnSave = this.handleClassLocationOnSave.bind(this);
 	
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
 	var cCopy = this.state.clazz;
 	if(this.props.authUser){
		cCopy.Author = this.props.authUser.key;
		cCopy.Members[cCopy.Author] = cCopy.Author;

	 	this.setState({
	 		classRef: this.props.firebase.class(this.state.clazz.key),
	 		clazz:cCopy,
	 		loading:false,


	 		
	 	})

 	}
 	


 }
 componentWillReceiveProps(props){
 	if(this.state.clazz.Author != props.authUser.key){
 		var cCopy = this.state.clazz;
 		cCopy.Author = props.authUser.key;
 		cCopy.Members[cCopy.Author] = cCopy.Author;
 		this.setState({ 
 			clazz: cCopy,
 			loading:false,

 		})
 	}
 		
 }
 onChange = event => {
    
  	this.setState({ [event.target.name]: event.target.value });
    

 };
 componentWillUnmount(){
 	this.props.firebase.class().off();
 }
  handleClassTitleOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Title){
 		cCopy.Title = value;
 		this.setState({clazz:cCopy}, this.handleClassTitleValidate);
 	}
 	
 }
 handleClassTitleValidate(){
 	const {clazz,errors} = this.state;
 	if(clazz.Title.length == 0){
 		errors["Title"] = 'TITLE.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(clazz.Title.length <= 5){
 		errors["Title"] = 'TITLE.<span class="red">ISTOOSHORT</span>'; 		
 	}
 	else delete errors["Title"];
 	this.setState({errors:errors});

 }
 handleClassTitleOnSave(){

 }
   handleClassScheduleOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Schedule){
 		cCopy.Schedule = value;
 		this.setState({clazz:cCopy},this.handleClassScheduleValidate);
 	}
 	
 }

 handleClassScheduleValidate(){
	const {clazz,errors} = this.state;
 	const text = clazz.Schedule.replace(/<(.|\n)*?>/g, '').trim();
 	if(text.length == 0){
 		errors["Schedule"] = 'SCHEDULE.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(text.length <= 20){
 		errors["Schedule"] = 'SCHEDULE.<span class="red">ISTOOSHORT</span>'; 		
 	}
 	else delete errors["Schedule"];
 	this.setState({errors:errors});
 }
 handleClassScheduleOnSave(){

 }
   handleClassLocationOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Location){
 		cCopy.Location = value;
 		this.setState({clazz:cCopy},this.handleClassLocationValidate);
 	}
 	
 }
 handleClassLocationValidate(){
	const {clazz,errors} = this.state;
 	const text = clazz.Location.replace(/<(.|\n)*?>/g, '').trim();
 	if(text.length == 0){
 		errors["Location"] = 'LOCATION.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(text.length <= 10){
 		errors["Location"] = 'LOCATION.<span class="red">ISTOOSHORT</span>'; 		
 	}
 	else delete errors["Location"];
 	this.setState({errors:errors});
 }
 handleClassLocationOnSave(){

 }
   handleClassDescriptionOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Description){
 		cCopy.Description = value;
 		this.setState({clazz:cCopy},this.handleClassDescriptionValidate);
 	}
 	
 }
 handleClassDescriptionValidate(){
	const {clazz,errors} = this.state;
	const text = clazz.Description.replace(/<(.|\n)*?>/g, '').trim();
 	if(text.length == 0){
 		errors["Description"] = 'DESCRIPTION.<span class="red">ISREQUIRED</span>'; 		
 	}
 	else if(text.length <= 20){
 		errors["Description"] = 'DESCRIPTION.<span class="red">ISTOOSHORT</span>'; 		
 	}
 	else delete errors["Description"];
 	this.setState({errors:errors});
 }
 handleClassDescriptionOnSave(){

 }
 handleThumbnailUpload(event){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var cCopy = this.state.clazz;
 	cCopy.ThumbnailFilename = uuidv4() + '.' + ext;

 	var storageRef = this.props.firebase.storage.ref('/classes/' + cCopy.ThumbnailFilename);
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
	 		this.setState({uploadPercent:0,uploading:false,clazz:cCopy},this.handleThumbnailValidate)

	 	})


 }
 handleThumbnailValidate(){
 	const {clazz,errors} = this.state;
	
 	if(clazz.ThumbnailFilename.length == 0){
 		errors["Thumbnail"] = 'THUMBNAIL.<span class="red">ISREQUIRED</span>'; 		
 	}
 	
 	else delete errors["Thumbnail"];
 	this.setState({errors:errors});
 }
 saveChangesHandler(event){

 	const {errors} = this.state;
 	if(Object.keys(errors).length == 0){
 		this.state.classRef.set({
	 		...this.state.clazz
	 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.props.history.push("/classes/" + this.state.clazz.key);
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
 	
 	const {loading, clazz} = this.state;
 	const {Title,Description,Schedule,Location} = clazz;
 	const {authUser} = this.props;
 	
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div className="loading">Loading ...</div>);

     
	return (
		<section id="new-class">
		<div className="main">
			<h1>New Class</h1>
			<div className="main-area">
			<div className='thumbnail'>
				{this.state.uploading && (
						<progress value={this.state.uploadPercent} max="100"/>
					)}	
					{!!clazz.ThumbnailFilename && !this.state.uploading &&(
						<LazyImage file={this.props.firebase.storage.ref('/classes/' + clazz.ThumbnailFilename)}/>
					)}
					<label className="upload" for="files">
						<input id="files" type="file" onChange={this.handleThumbnailUpload}/>
					</label>
			</div>
				<div className={'container'}>
				<h4>Title</h4>
				<TCSEditor 
					disabled={false}
					type='plain'
					onEditorChange={this.handleClassTitleOnChange} 
					onEditorSave={this.handleClassTitleOnSave}
					placeholder={'Class Title'} 
					text={clazz.Title}/>
			</div>
				<div className={'container'}>
				<h4>Description</h4>
			</div>
				<div className={'container'}>
				<TCSEditor 
					disabled={false}
					type='text'
					onEditorChange={this.handleClassDescriptionOnChange} 
					onEditorSave={this.handleClassDescriptionOnSave}
					placeholder={'Class Description'} 
					text={clazz.Description}/>
			</div>
				<div className={'container'}>
				<h4>Schedule</h4>
			</div>
				<div className={'container'}>
				<TCSEditor 
					disabled={false}
					type='text'
					onEditorChange={this.handleClassScheduleOnChange} 
					onEditorSave={this.handleClassScheduleOnSave}
					placeholder={'Class Schedule'} 
					text={clazz.Schedule}/>
			</div>
				<div className={'container'}>
				<h4>Location</h4>
			</div>
				<div className={'container'}>
				<TCSEditor 
					disabled={false}
					type='text'
					onEditorChange={this.handleClassLocationOnChange} 
					onEditorSave={this.handleClassLocationOnSave}
					placeholder={'Class Location'} 
					text={clazz.Location}/>
			</div>
			</div>
			
			<button disabled={false} onClick={this.saveChangesHandler}>Save Changes</button>
		</div>
		</section>
	)



 	
	}
}

const condition = authUser => !!authUser && !!authUser.roles[ROLES.ADMIN];
const NewClassPage = withFirebase(withAuthorization(condition)(NewClassPageBase));

export default NewClassPage;