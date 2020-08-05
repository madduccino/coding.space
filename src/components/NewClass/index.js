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
 		class: {
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
 	this.handleClassTitleOnChange = this.handleClassTitleOnChange.bind(this);
 	this.handleClassTitleOnSave = this.handleClassTitleOnSave.bind(this);
 	this.handleClassDescriptionOnChange = this.handleClassDescriptionOnChange.bind(this);
 	this.handleClassDescriptionOnSave = this.handleClassDescriptionOnSave.bind(this);
 	this.handleClassScheduleOnChange = this.handleClassScheduleOnChange.bind(this);
 	this.handleClassScheduleOnSave = this.handleClassScheduleOnSave.bind(this);
 	this.handleClassLocationOnChange = this.handleClassLocationOnChange.bind(this);
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
 	var cCopy = this.state.class;
 	if(this.props.authUser){
		cCopy.Author = this.props.authUser.key;
		cCopy.Members[cCopy.Author] = cCopy.Author;

	 	this.setState({
	 		classRef: this.props.firebase.class(this.state.class.key),
	 		class:cCopy,
	 		loading:false,


	 		
	 	})

 	}
 	


 }
 componentWillReceiveProps(props){
 	if(this.state.class.Author != props.authUser.key){
 		var cCopy = this.state.class;
 		cCopy.Author = props.authUser.key;
 		cCopy.Members[cCopy.Author] = cCopy.Author;
 		this.setState({ 
 			class: cCopy,
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
 	var cCopy = this.state.class;
 	if(value !== cCopy.Title){
 		cCopy.Title = value;
 		this.setState({class:cCopy});
 	}
 	
 }
 handleClassTitleOnSave(){

 }
   handleClassScheduleOnChange(value){
 	var cCopy = this.state.class;
 	if(value !== cCopy.Schedule){
 		cCopy.Schedule = value;
 		this.setState({class:cCopy});
 	}
 	
 }
 handleClassScheduleOnSave(){

 }
   handleClassLocationOnChange(value){
 	var cCopy = this.state.class;
 	if(value !== cCopy.Location){
 		cCopy.Location = value;
 		this.setState({class:cCopy});
 	}
 	
 }
 handleClassLocationOnSave(){

 }
   handleClassDescriptionOnChange(value){
 	var cCopy = this.state.class;
 	if(value !== cCopy.Description){
 		cCopy.Description = value;
 		this.setState({class:cCopy});
 	}
 	
 }
 handleClassDescriptionOnSave(){

 }
 handleThumbnailUpload(event){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var cCopy = this.state.class;
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
	 		this.setState({uploadPercent:0,uploading:false,class:cCopy})

	 	})


 }
 
 saveChangesHandler(event){

 	this.state.classRef.set({
 		...this.state.class
 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.props.history.push("/classes/" + this.state.class.key);
 		})
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {loading} = this.state;
 	const clazz = this.state.class;
 	const {Title,Description,Schedule,Location} = clazz;
 	const {authUser} = this.props;
 	
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
	var isInvalid =
      Title === '' ||
      Description === '' ||
      Schedule === '' ||
      Location === '';
     
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
			
			<button disabled={isInvalid} onClick={this.saveChangesHandler}>Save Changes</button>
		</div>
		</section>
	)



 	
	}
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN];
const NewClassPage = withFirebase(withAuthorization(condition)(NewClassPageBase));

export default NewClassPage;