import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';
import * as CATEGORIES from '../../constants/categories';



class UniversePublish extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		uploading:false,
 		uploadPercent:0,
 		errors:{
 			"Title":'TITLE.<span class="red">ISREQUIRED</span>',
 			"Description":'DESCRIPTION.<span class="red">ISREQUIRED</span>',
 			"Thumbnail":'THUMBNAIL.<span class="red">ISREQUIRED</span>',
 			"Categories":'CATS.<span class="red">GR8TR.THAN.2.REQUIRED</span>',
 			"URL":'URL.<span class="red">ISREQUIRED</span>',
 		},
 		project: {
 			key:uuidv4(),
 			Author:null,
 			untut:null,
 			Categories:{},
 			Description:'',
 			Level:1,
 			ThumbnailFilename:null,
 			Title:'',
 			Status:'APPROVED',
 			URL:''

 		},




 	}
 
 	this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
 	this.handleThumbnailValidate = this.handleThumbnailValidate.bind(this);
 	this.handlePTitleOnChange = this.handlePTitleOnChange.bind(this);
 	this.handlePTitleValidate = this.handlePTitleValidate.bind(this);
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
 	this.handlePDescriptionValidate = this.handlePDescriptionValidate.bind(this);
	this.handlePURLOnChange = this.handlePURLOnChange.bind(this);
	this.handlePURLValidate = this.handlePURLValidate.bind(this);
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
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	const {project, projectRef} = this.state;
 	
	this.props.firebase.untutorial(key).on('value',snapshot=>{
		let untutorial = snapshot.val();
		
		project.untut = key;
		project.Level = untutorial.Level;
		

		this.setState({project:project,loading:false});
	})


 	
 	


 }
 componentWillReceiveProps(props){
 	const {authUser} = props;
 	const {project} = this.state;
 	if(!project.Author){
 		project.Author = authUser.uid;
 		this.setState({ 
 			project: project,

 		})
 	}
 		
 }


 componentWillUnmount(){
 	this.props.firebase.untutorial().off();
 }
  handlePTitleOnChange(value){
 	var pCopy = this.state.project;
 	if(value !== pCopy.Title){
 		pCopy.Title = value;
 		this.setState({project:pCopy});
 		this.handlePTitleValidate();
 	}
 	
 }
 handlePTitleValidate(){
 	const {project,errors} = this.state;
	const {Title} = project;
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
 handleThumbnailUpload(event){
 	var file = event.target.files[0];
 	var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
 	var pCopy = this.state.project;
 	var {authUser} = this.props;
 	pCopy.ThumbnailFilename = uuidv4() + '.' + ext;

 	var storageRef = this.props.firebase.storage.ref('/public/' + authUser.uid + '/' + pCopy.ThumbnailFilename);
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
	 		this.setState({uploadPercent:0,uploading:false,project:pCopy},this.handleThumbnailValidate)

	 	})


 }
 handleThumbnailValidate(){
 	const {project,errors} = this.state;
	const {ThumbnailFilename} = project;
	const text = ThumbnailFilename.replace(/<(.|\n)*?>/g, '').trim();
	if(text.length === 0){

		errors['Thumbnail'] = 'THUMBNAIL.<span class="red">ISREQUIRED</span>';
	}

	else{
		delete errors['Thumbnail'];
	}
	this.setState({errors:errors});

 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.project;
 	if(value !== pCopy.Description){
 		pCopy.Description = value;
 		this.setState({project:pCopy},this.handlePDescriptionValidate);
 	}
 	
 }
 handlePDescriptionValidate(){
 	const {project,errors} = this.state;
	const {Description} = project;
	const text = Description.replace(/<(.|\n)*?>/g, '').trim();
	if(text.length === 0){

		errors['Description'] = 'DESCRIPTION.<span class="red">ISREQUIRED</span>';
	}
	else if(text.length < 20){
		errors['Description'] = 'DESCRIPTION.<span class="red">ISTOOSHORT</span>';
	}
	else{
		delete errors['Description'];
	}
	this.setState({errors:errors});
 }

 handlePURLOnChange(value){
	var pCopy = this.state.project;
 	if(value !== pCopy.URL){
 		pCopy.URL = value;
 		this.setState({project:pCopy}, this.handlePURLValidate);
 	}
 }
 handlePURLValidate(){
	const {project,errors} = this.state;
	const {URL} = project;
	const text = URL.replace(/<(.|\n)*?>/g, '').trim();
	if(text.length === 0){

		errors['URL'] = 'URL.<span class="red">ISREQUIRED</span>';
	}
	else if(text.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g) == null){
		errors['URL'] = 'URL.<span class="red">ISBAD</span>';
	}
	else{
		delete errors['URL'];
	}
	this.setState({errors:errors});
 }
 handlePCategoryOnChange(event){
 	const {project} = this.state;
 	project.Categories[event.target.value] = event.target.value;
 	this.setState({project:project},this.handleCategoryValidate);
 }
 handleCategoryOnClick(text){
 	const {project} = this.state;
 	delete project.Categories[text];
 	this.setState({project:project},this.handleCategoryValidate);

 }
 handleCategoryValidate(){
 	const {project,errors} = this.state;
 	if(Object.keys(project.Categories).length < 3){
 		errors["Categories"] = 'CATS.<span class="red">GR8TR.THAN.2.REQUIRED</span>';
 	}
 	else
 		delete errors["Categories"];
 	this.setState({errors:errors});
 }

 saveChangesHandler(event){

 	const {project, loading,errors} = this.state;
		const {Title,Description,URL,Author,untut, Level} = project;
		const {authUser} = this.props;
		const {key} = this.props.match.params;
		
		
		if(Object.values(errors).length === 0){
			project.LastModified = Date.now();
			project.Author = authUser.uid;
			this.props.firebase.project(project.key).set({
				...project
			})
			.then(()=>{
				console.log("Successfully Saved");
				window.location = ROUTES.UNIVERSE;
				
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
 	
 	const {project, loading} = this.state;
 	const {Title,Description,Level,Categories} = project;
 	const {authUser} = this.props;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div className="loading">Loading ...</div>);
	
	return (
	  	<section id="universe-publish">
		  	<div className="filter">
				    
			    {Object.keys(project.Categories).length != Object.keys(CATEGORIES).length && (
					<select onChange={this.handlePCategoryOnChange}>
				    	{Object.keys(CATEGORIES).filter(f=>!Object.keys(project.Categories).includes(f)).map(catName=><option value={catName}>{catName}</option>)}
				    </select>
			    )}
			    
			    
			</div>	

		    {Object.keys(project.Categories).length > 0 && (
		    	<div className="filter-categories">
		    		{Object.keys(project.Categories).map(f=>(
		    			<a onClick={()=>this.handleCategoryOnClick(f)}>{f}</a>
		    		))}
		    	</div>
		    )}	
			<div className="main">

				<div className="main-area">
					<div className={'container'}>
						<div>
							<TCSEditor 
							disabled={false}
							type='plain'
							editing={true}
							save={false}
							onEditorChange={this.handlePTitleOnChange} 
							placeholder={'Project Title'} 
							text={project.Title}/>
				   		</div>
			   			<div>
			    			<h4>Thumbnail</h4>
							<input type="file" onChange={this.handleThumbnailUpload}/>
							{this.state.uploading && (
								<progress value={this.state.uploadPercent} max="100"/>
							)}
							{!!project.ThumbnailFilename && project.ThumbnailFilename!=='' && !this.state.uploading &&(
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							)}				
						</div>
						<div>
							<h4>Description</h4>
							<TCSEditor 
								disabled={false}
								type='text'
								editing={true}
								save={false}
								onEditorChange={this.handlePDescriptionOnChange} 
								placeholder={'Project Description'} 
								text={project.Description}/>
						</div>
						<div>
							<h4>URL</h4>
							<TCSEditor 
								disabled={false}
								type='plain'
								editing={true}
								save={false}
								onEditorChange={this.handlePURLOnChange} 
								placeholder={'Project URL'} 
								text={project.URL}/>
						</div>

	
					</div>
				</div>
				<div className="main-content">
			

					<button disabled={false} onClick={this.saveChangesHandler}>PUBLISH!</button> 

				</div>
			</div>
	  	</section>	
	)



 	
	}
}


 

export default withFirebase(withAuthentication(UniversePublish));