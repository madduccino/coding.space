import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';



class ProjectPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		author:null,
 		loading:true,
 		project: {},



 	}
 	this.handlePDescriptionOnChange = this.handlePDescriptionOnChange.bind(this);
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
 	//console.log(this.authUser);

 	const {key} = this.props.match.params;

 	this.props.firebase.project(key).on('value', snapshot => {
 		const project = snapshot.val();
 		this.props.firebase.profile(project.Author).once('value')
 			.then(snapshot2 => {
 				const prof = snapshot2.val();
 				this.setState({
		 			project: project,
		 			author:prof,
		 			loading:false,
		 		})
 			})
 		

 		

 		
 	})


 }

 componentWillUnmount(){
 	this.props.firebase.project().off();
 }
 handlePDescriptionOnChange(value){
 	var pCopy = this.state.project;
 	pCopy.Description = value;
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
 	const {key} = this.props.match.params;

 	this.props.firebase.project(key).set({
 		...this.state.project
 	})
 		.then(()=>console.log("Successfully Saved"))
 		.catch(error=>console.log(error));
 	console.log("Save Changes");
 }

 render(){
 	
 	const {project, loading, author} = this.state;
 	const {authUser} = this.props;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
 	
 	//can edit
	if(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===project.Author) )
 	{
 		return (
 			<div>
 				<h1>{project.Title}</h1>
 				<h3>by: <a href={'/profile/' + project.Author}>{author.Name}</a></h3>
 				<div className={'container'}>
 					<TCSEditor onEditorChange={this.handlePDescriptionOnChange} placeholder={'Project Description'} text={project.Description}/>
 				</div>
 				<div className={'container'}>
 					{Object.keys(project.steps).map(step => (
 						<div>
							<TCSEditor onEditorChange={(value)=>this.handleStepOnChange(value,step)} placeholder={'Step Description'} text={project.steps[step].Description}/>
							<button  onClick={(event)=>this.deleteStepHandler(event,step)}>Delete Step</button>
						</div>
					))}
 				</div>
 				<button onClick={this.addStepHandler}>Add Step</button>
 				<button onClick={this.saveChangesHandler}>Save Changes</button>
 			</div>
 		)

 	}

 	return (
			<div>
	 			<h1>{project.Title}</h1>
	 			<h3>by: <a href={'/profile/' + project.Author}>{author.Name}</a></h3>
				<div className={'container'} dangerouslySetInnerHTML={{__html:project.Description}}/>
				<div className={'container'}>
					{Object.keys(project.steps).map(step => (
						<div class="block" dangerouslySetInnerHTML={{__html:project.steps[step].Description}}/>
					))}
				</div>

			</div>
 		)
}
}


const ProjectPage = withFirebase(withAuthentication(ProjectPageBase));

export default ProjectPage;