import React from 'react';
import {withAuthorization} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';


class ResourcePageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		resource: {},
 		author:'',
 		errors:{},
 		dirty:false,
 		uploading:false,
 		uploadPercent:0,



 	}
 	//this.deleteResourceHandler = this.deleteResourceHandler.bind(this);
 	this.handleBodyOnChange = this.handleBodyOnChange.bind(this);
 	this.handleBodyOnSave = this.handleBodyOnSave.bind(this);
 	this.handleFileUpload = this.handleFileUpload.bind(this);
 	this.handleTitleOnChange = this.handleTitleOnChange.bind(this);
 	this.handleTitleOnSave = this.handleTitleOnSave.bind(this);
 	this.saveChangesHandler = this.saveChangesHandler.bind(this);
	this.validateTitle = this.validateTitle.bind(this);
 	this.validateBody = this.validateBody.bind(this);
 	this.createResource = this.createResource.bind(this);


 	
 	//this.onChange = editorState => this.setState({editorState});
 	//console.log("hiya");

 }



 componentDidMount(){
 	//console.log(this.authUser);
 	
 	var {key} = this.props.match.params;
 	if(!key)
 		key = this.props.default;

 	this.props.firebase.resource(key).on('value', snapshot => {
 		const resource = snapshot.val();
 		this.setState({
 			resource: resource,
 			author:resource.Author,
 			loading:false,
 		})
	
 		

 		

 		
 	})


 }
 

 componentWillUnmount(){
 	//this.props.firebase.proj().off();
 	this.props.firebase.resource().off();
 }
 handleFileUpload(event){
 	
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var oCopy = this.state.resource;
 	const {authUser} = this.props;
 	const filename = uuidv4() + '.' + ext;
 	if(!oCopy.files)
 		oCopy.files = [];
 	oCopy.files.push({Title:file.name,Filename:filename});

 	var storageRef = this.props.firebase.storage.ref('/public/' + oCopy.Author + '/' + filename);
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
	 		this.setState({uploadPercent:0,uploading:false,resource:oCopy,dirty:true}, this.saveChangesHandler)

	 	})


 }
 
 handleTitleOnChange(value){
 	var oCopy = this.state.resource;
 	if(value !== oCopy.Title){
 		oCopy.Title = value;
	 	
	 	this.setState({resource:oCopy,dirty:true});
	 	this.validateTitle();
 	}
 	
 	
 }

 handleTitleOnSave(value){
 	this.saveChangesHandler();
 }
 validateTitle(){
 	const {resource,errors} = this.state;
 	const {Title} = resource;
 	const text = Title.replace(/<(.|\n)*?>/g, '').trim();
 	if(text.length === 0){

 		errors['Title'] = 'TITLE.<span class="red">ISREQUIRED</span>';
 	}
 	if(text.length < 5){

 		errors['Title'] = 'TITLE.<span class="red">ISTOOSHORT</span>';
 	}
 	else{
 		delete errors['Title'];
 	}
 	this.setState({errors:errors});

 }

 handleBodyOnChange(value){
 	var oCopy = this.state.resource;
 	if(value !== oCopy.Body){
 		oCopy.Body = value;
	 	
	 	this.setState({resource:oCopy,dirty:true});
	 	this.validateBody();
 	}
 	
 	
 }
 handleBodyOnSave(value){
 	this.saveChangesHandler();
 }
  validateBody(){
 	const {resource,errors} = this.state;
 	const {Body} = resource;
 	const text = Body.replace(/<(.|\n)*?>/g, '').trim();
 	if(text===''){

 		errors['Body'] = 'BODY.<span class="red">ISREQUIRED</span>';
 	}
 	if(text.length < 20){

 		errors['Body'] = 'BODY.<span class="red">ISTOOSHORT</span>';
 	}
 	else{
 		delete errors['Body'];
 	}
 	this.setState({errors:errors});

 }

 saveChangesHandler(event){

 	const {resource, loading, author,errors} = this.state;
 	const {Title,Body} = resource;
 	const {authUser} = this.props;
 	var {key} = this.props.match.params;
 	if(!key)
 		key = this.props.default;
 
	
 	if(Object.values(errors).length === 0){
 		this.props.firebase.resource(key).set({
	 		...this.state.resource
	 	})
 		.then(()=>{
 			console.log("Successfully Saved");
 			this.setState({dirty:false})
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
			
		})
 	}

 	
 	console.log("Save Changes");
 }


createResource(){

 	const {authUser} = this.props;
 	const key = uuidv4();
 	this.props.firebase.resource(key).set({
	 		Title:'',
	 		Body:'',
	 		Author:authUser.key
	 	})
 		.then(()=>{
 			console.log("Successfully Created");
 			window.location = ROUTES.RESOURCE_HOME + '/' + key;
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



 
 render(){
 	
 	const {resource, loading, author} = this.state;
 	const {Title,Body,files} = resource;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;


 	if(loading)
 		return (<div>Loading ...</div>);
 	

 	

	return (
		<section id="resources">
		{!!authUser && !!authUser.roles['ADMIN'] && (

			<div className="toolbar">
				<button onClick={this.createResource}>Create Resource</button>
			</div>
		
		)}
		<div className="main">
			<h2>
				<TCSEditor 
					disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===resource.Author))}
					type={'plain'}
					name={'title'}
					onEditorChange={this.handleTitleOnChange}
					onEditorSave={this.handleTitleOnSave}
					placeholder={'Resource Title'} 
					text={resource.Title} />
			</h2>
			<div className={'container'}>
				
				<TCSEditor 
					disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===resource.Author))}
					type={'text'}
					
					onEditorChange={this.handleBodyOnChange}
					onEditorSave={this.handleBodyOnSave}
					placeholder={'Resource Body'} 
					text={resource.Body} />

			</div>
			{/* <div className={'container'}>
			    <h4>Files</h4>
				<input type="file" onChange={this.handleFileUpload}/>
				{this.state.uploading && (
					<progress value={this.state.uploadPercent} max="100"/>
				)}

				
			</div> */}
			{/* {!!files && files.length > 0 && (
				<div className={'container'}>
					<ul>
					{files.map(file=>(
						<li><LazyLink className={'download'} file={this.props.firebase.storage.ref('/public/' + resource.Author + '/' + file.Filename)} Text={file.Title}/></li>
					))}
					</ul>
				</div>
			)} */}
		
			
		</div>
		</section>
	)

}
 	

 	

}

const condition = authUser => !!authUser && (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ResourcePage = withFirebase(withAuthorization(condition)(ResourcePageBase));

export default ResourcePage;