import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import ListBox from 'react-listbox';
import 'react-listbox/dist/react-listbox.css';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';
import { v4 as uuidv4 } from 'uuid';



class ClassPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		clazz: {},
 		profiles:null,
 		selectedMembers:{},
 		uploading:false,
 		uploadPercent:0,
 		dirty:false,



 	}
 	this.handleClassTitleOnChange = this.handleClassTitleOnChange.bind(this);
 	this.handleClassTitleOnSave = this.handleClassTitleOnSave.bind(this);
 	this.handleClassDescriptionOnChange = this.handleClassDescriptionOnChange.bind(this);
 	this.handleClassDescriptionOnSave = this.handleClassDescriptionOnSave.bind(this);
 	this.handleClassScheduleOnChange = this.handleClassScheduleOnChange.bind(this);
 	this.handleClassScheduleOnSave = this.handleClassScheduleOnSave.bind(this);
 	this.handleClassLocationOnChange = this.handleClassLocationOnChange.bind(this);
 	this.handleClassLocationOnSave = this.handleClassLocationOnSave.bind(this);
 	this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleStatusOnSave = this.handleStatusOnSave.bind(this);
 	this.handleMembersOnChange = this.handleMembersOnChange.bind(this);
 	this.handleMembersOnSave = this.handleMembersOnSave.bind(this);
 	this.deleteClassHandler = this.deleteClassHandler.bind(this);
 	this.saveChangesHandler = this.saveChangesHandler.bind(this);
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	
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

 	this.props.firebase.class(key).on('value', snapshot => {
 		const clazz = snapshot.val();
 		this.props.firebase.profiles().once('value')
 			.then(snapshot2 => {
 				const prof = snapshot2.val();
 				this.setState({
		 			clazz: clazz,
		 			profiles: prof,
		 			loading:false,
		 		})
 			})
 		
 	})


 }

 componentWillUnmount(){
 	this.props.firebase.class().off();
 	this.props.firebase.profiles().off();
 }
 handleClassTitleOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Title){
 		cCopy.Title = value;
	 
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleClassTitleOnSave(){
 	this.saveChangesHandler();
 }
 handleClassDescriptionOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Description){
 		cCopy.Description = value;
	 	
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleClassDescriptionOnSave(){
 	this.saveChangesHandler();
 }
 handleClassScheduleOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Schedule){
 		cCopy.Schedule = value;
	 	
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleClassScheduleOnSave(){
 	this.saveChangesHandler();
 }
  handleClassLocationOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Location){
 		cCopy.Location = value;
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleClassLocationOnSave(){
 	this.saveChangesHandler();
 }
 handleStatusOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Status){
 		cCopy.Status = value;
 		this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleStatusOnSave(){
 	this.saveChangesHandler();
 }
 handleMembersOnChange(selectedMembers){
	var cCopy = this.state.clazz;
	cCopy.Members = {};
	for(var i = 0; i < selectedMembers.length; i++){
		cCopy.Members[selectedMembers[i]] = selectedMembers[i];
	}

	 	
	this.setState({clazz:cCopy,dirty:true},this.saveChangesHandler);
 }
 handleMembersOnSave(){
 	this.saveChangesHandler();
 }
 deleteClassHandler(value){
 	const {key} = this.props.match.params;

 	this.props.firebase.class(key).remove();
 	window.location = ROUTES.LANDING;
 }
 handleThumbnailUpload(event){
 	
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var cCopy = this.state.clazz;
 	const {authUser} = this.props;

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
	 		this.setState({uploadPercent:0,uploading:false,clazz:cCopy,dirty:true})

	 	})


 }
 
 saveChangesHandler(event){
 	const {key} = this.props.match.params;
 	const {clazz} = this.state;

 	
 	this.props.firebase.class(key).set({
 		...clazz
 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.setState({dirty:false})
 		})
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {clazz, loading,dirty,uploading,uploadPercent, profiles} = this.state;
 	const {authUser} = this.props;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
 	const isInvalid = 
 		clazz.Title === '' ||
 		clazz.Description === '' ||
 		clazz.Schedule === '' ||
 		clazz.Location === '' ||
 		Object.keys(clazz.Members).length <= 0 ||
 		loading;
 	
 	//can edit

	//assemble listbox data
	const listBoxOptions = [];
	const listBoxSelected = [];
	if(!!profiles){
		Object.keys(profiles).map(profile=>{
			listBoxOptions.push({
				label:!!profiles[profile].roles[ROLES.TEACHER] ? profiles[profile].Username.replace('.',' ') + "(TEACHER)" : profiles[profile].Username.replace('.',' '),
				value:profiles[profile].key,
			})
			if(!!clazz.Members[profiles[profile].key])
				listBoxSelected.push(profile);
		})
			
	}
	

	return (
	 <section id="clazz">
		<div className="approve"> 
		  <div>
			<TCSEditor 
					disabled={!(!!authUser && !!authUser.roles['ADMIN'] )}
					type='select'
					selectOptions={['DRAFT','APPROVED']}
					onEditorChange={this.handleStatusOnChange} 
					onEditorSave={this.handleStatusOnSave}
					placeholder={'Class Status'} 
					text={clazz.Status}/>
		  </div>
		</div>
		<div className="main">
		  <div className="side-panel">
			<div className="content">
			<div className="avatar">
			{!!clazz.ThumbnailFilename && !uploading &&(
					<LazyImage file={this.props.firebase.storage.ref('/classes/' + clazz.ThumbnailFilename)}/>
				)}
				<input type="file" onChange={this.handleThumbnailUpload}/>
				{uploading && (
					<progress value={uploadPercent} max="100"/>
				)}
			</div>
			<div>
			  <h4>Class Title</h4>
				<TCSEditor 
					disabled={!(!!authUser && !!authUser.roles['ADMIN'] )}
					type='plain'
					onEditorChange={this.handleClassTitleOnChange} 
					onEditorSave={this.handleClassTitleOnSave}
					placeholder={'Class Title'} 
					text={clazz.Title}/>
			</div>

			<div>
			<h4>Description</h4>

				<TCSEditor 
					disable={!(!!authUser && !!authUser.roles['ADMIN'] )}
					type='text'
					onEditorChange={this.handleClassDescriptionOnChange} 
					onEditorSave={this.handleClassDescriptionOnSave}
					placeholder={'Class Description'} 
					text={clazz.Description}/>
			</div>

			<div>
			<h4>Schedule</h4>
			<TCSEditor 
				disabled={!(!!authUser && !!authUser.roles['ADMIN'] )}
				type='text'
				onEditorChange={(value)=>this.handleClassScheduleOnChange(value)} 
				onEditorSave={this.handleClassScheduleOnSave}
				placeholder={'Schedule Description'} 
				text={clazz.Schedule}/>
			</div>
			<div>
			<h4>Location</h4>
			<TCSEditor
				disabled={!(!!authUser && !!authUser.roles['ADMIN'] )}
				type='text' 
				onEditorChange={(value)=>this.handleClassLocationOnChange(value)} 
				onEditorSave={this.handleClassLocationOnSave}
				placeholder={'Location Description'} 
				text={clazz.Location}/>
			</div>

        </div>
		</div>
			{/* <button onClick={this.deleteClassHandler}>Delete Class</button> */}
		<div className="main-area">
		<h3>Students and Teachers</h3>
	
			{!!profiles && (

				<div className={'container'}>
				<ListBox 
					options={listBoxOptions} 
					onChange={this.handleMembersOnChange} 
					selected={listBoxSelected}/>
			</div>
		)}
		</div>
		</div>
		</section>
	)

 	

}
}

const condition = authUser => authUser && (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ClazzPage = withFirebase(withAuthentication(ClassPageBase));

export default ClazzPage;