import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthorization} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import * as ROLES from '../../constants/roles';



class ClassPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		clazz: {},
 		profiles:null,



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
 	
 	const {clazz, loading, profiles} = this.state;
 	const {authUser} = this.props;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);
 	
 	//can edit
	if(authUser && !!authUser.roles['ADMIN']  )
 	{
 		return (
 			<div>
 				<h1>{clazz.Title}</h1>
 				
 				<div className={'container'}>
 					<TCSEditor onEditorChange={this.handlePDescriptionOnChange} placeholder={'Class Description'} text={clazz.Description}/>
 				</div>
 				<div className={'container'}>
					<TCSEditor onEditorChange={(value)=>this.handleStepOnChange(value)} placeholder={'Schedule Description'} text={clazz.Schedule}/>
 				</div>
 				<button onClick={this.addStepHandler}>Add Step</button>
 				<button onClick={this.saveChangesHandler}>Save Changes</button>
 			</div>
 		)

 	}

 	return (
			<div>
	 			<h1>{clazz.Title}</h1>
	 			
				<div className={'container'} dangerouslySetInnerHTML={{__html:clazz.Description}}/>
				

			</div>
 		)
}
}

const condition = authUser => authUser && (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ClazzPage = withFirebase(withAuthorization(condition)(ClassPageBase));

export default ClazzPage;