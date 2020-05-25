import React from 'react';
import './index.css';
import './styles.css';
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
 	this.handleClassDescriptionOnChange = this.handleClassDescriptionOnChange.bind(this);
 	this.handleClassScheduleOnChange = this.handleClassScheduleOnChange.bind(this);
 	this.handleClassLocationOnChange = this.handleClassLocationOnChange.bind(this);
 	this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
 	this.handleMembersOnChange = this.handleMembersOnChange.bind(this);
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
 handleClassDescriptionOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Description){
 		cCopy.Description = value;
	 	
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleClassScheduleOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Schedule){
 		cCopy.Schedule = value;
	 	
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
  handleClassLocationOnChange(value){
 	var cCopy = this.state.clazz;
 	if(value !== cCopy.Location){
 		cCopy.Location = value;
	 	
	 	this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleStatusOnChange(event){
 	var cCopy = this.state.clazz;
 	if(event.target.value !== cCopy.Status){
 		cCopy.Status = event.target.value;
 		this.setState({clazz:cCopy,dirty:true});
 	}
 	
 }
 handleMembersOnChange(selectedMembers){
	var cCopy = this.state.clazz;
	cCopy.Members = {};
	for(var i = 0; i < selectedMembers.length; i++){
		cCopy.Members[selectedMembers[i]] = selectedMembers[i];
	}

	 	
	this.setState({clazz:cCopy,dirty:true});
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
 	
 	//can edit
	if(!!authUser && !!authUser.roles['ADMIN']  )
 	{
 		//assemble listbox data
 		const listBoxOptions = [];
 		const listBoxSelected = [];
 		if(profiles){
 			Object.keys(profiles).map(profile=>{
 				listBoxOptions.push({
 					label:!!profiles[profile].roles[ROLES.TEACHER] ? profiles[profile].Username.replace('.',' ') + "(TEACHER)" : profiles[profile].Username.replace('.',' '),
 					value:profiles[profile].key,
 				})
 				if(!!clazz.Members[profiles[profile].key])
 					listBoxSelected.push(profile.key);
 			})
 				
 		}
 		

 		return (
 			<div>
 				<div className={'container'}>
					<h4>Class Title</h4>
				</div>
 				<div className={'container'}>
 					<TCSEditor onEditorChange={this.handleClassTitleOnChange} placeholder={'Class Title'} text={clazz.Title}/>
 				</div>
 				<select value={clazz.Status} onChange={this.handleStatusOnChange}>
 					<option value="DRAFT">DRAFT</option>
 					<option value="APPROVED">APPROVED</option>
 				</select>
 				<div className={'container'}>
					<h4>Thumbnail</h4>
				</div>
				<div className={'container'}>
					<input type="file" onChange={this.handleThumbnailUpload}/>
					{uploading && (
						<progress value={uploadPercent} max="100"/>
					)}
					{!!clazz.ThumbnailFilename && !uploading &&(
						<LazyImage file={this.props.firebase.storage.ref('/classes/' + clazz.ThumbnailFilename)}/>
					)}
					
				</div>
				<div className={'container'}>
					<h4>Description</h4>
				</div>
 				<div className={'container'}>
 					<TCSEditor onEditorChange={this.handleClassDescriptionOnChange} placeholder={'Class Description'} text={clazz.Description}/>
 				</div>
 				<div className={'container'}>
					<h4>Schedule</h4>
				</div>
 				<div className={'container'}>
					<TCSEditor onEditorChange={(value)=>this.handleClassScheduleOnChange(value)} placeholder={'Schedule Description'} text={clazz.Schedule}/>
 				</div>
 				<div className={'container'}>
					<h4>Location</h4>
				</div>
 				<div className={'container'}>
					<TCSEditor onEditorChange={(value)=>this.handleClassLocationOnChange(value)} placeholder={'Location Description'} text={clazz.Location}/>
 				</div>
 				{!!profiles && (
 					<div className={'container'}>
						<h4>Students and Teachers</h4>
						<ListBox options={listBoxOptions} onChange={this.handleMembersOnChange} selected={listBoxSelected}/>
					</div>
				)}

 				 {this.state.dirty && (
 					<button onClick={this.saveChangesHandler}>Save Changes</button>
 				)}
 				<button onClick={this.deleteClassHandler}>Delete Class</button>
 			</div>
 		)

 	}
 	//else if(!!authUser && !!authUser.roles['TEACHER'])


 	return (
			<div>
	 			<h1  dangerouslySetInnerHTML={{__html:clazz.Title}}/>
	 			{!!clazz.ThumbnailFilename && (
	 				<LazyImage file={this.props.firebase.storage.ref('/classes/' + clazz.ThumbnailFilename)}/>
	 			)}
				<div className={'container'} dangerouslySetInnerHTML={{__html:clazz.Description}}/>
				<div className={'container'} dangerouslySetInnerHTML={{__html:clazz.Schedule}}/>
				<div className={'container'} dangerouslySetInnerHTML={{__html:clazz.Location}}/>
				{!!authUser && !!authUser.roles[ROLES.TEACHER] && !!profiles && (
					<div className={'container'}>
						<h4>Students and Teachers</h4>
						<ul>
						{Object.keys(profiles).filter(profile=>!!clazz.Members[profiles[profile].key]).map(profile=>( 
							<li>
								<a href={'/profile/' + profiles[profile].key}>{!!profiles[profile].roles[ROLES.TEACHER] ? profiles[profile].Username.replace('.',' ') + "(TEACHER)" : profiles[profile].Username.replace('.',' ')}</a>
							</li>
						))}
						</ul>
					</div>
				)}
				

			</div>
 		)
}
}

const condition = authUser => authUser && (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ClazzPage = withFirebase(withAuthentication(ClassPageBase));

export default ClazzPage;