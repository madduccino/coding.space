import React from 'react';
import './index.css';
import './styles.css';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthorization} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import * as ROLES from '../../constants/roles';



class ClassesPageBase extends React.Component {

 constructor(props){
 	super(props);
 	this.state = {
 		authUser:null,
 		loading:true,
 		classes: {},




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
 	this.props.firebase.classes().on('value',snapshot => {
 		const classes = snapshot.val();
		this.setState({
			classes:classes,
			loading:false,
		})
		
	})
 	


 }

 componentWillUnmount(){
 	this.props.firebase.project().off();
 }
 handlePDescriptionOnChange(value){

 }
 handleStepOnChange(value,step){

 }
 deleteStepHandler(event,key){

 }
 addStepHandler(event){

 }
 saveChangesHandler(event){

 }

 render(){
 	
 	const {classes, loading} = this.state;
 	const {authUser} = this.props;
 	//const {key} = this.props.match.params;
 	
 	//console.log(Object.keys(project));
 	if(loading)
 		return (<div>Loading ...</div>);

	return (
			<div>
				<div style={{padding:30 + 'px',marginLeft:0 + 'px',marginRight:0 + 'px',textAlign:'center'}}>
				   <h1>The Coding Space Classes</h1>
				</div>
				
				
				<div id="level1" class="level-container">


				   <div class="level">
					    {loading && <div>Loading ...</div>}
						{Object.keys(classes).filter(clazz=>classes[clazz].Status==='APPROVED').map(clazz => (
							
							<div id={clazz.key} class={'wsite-image wsite-image-border-none project'}>
								<a href={'/classes/' + clazz} path={'/classes/' + classes[clazz].ThumbnailFilename}>
									<LazyImage file={this.props.firebase.storage.ref('/classes/' + classes[clazz].ThumbnailFilename)}/>
								</a>
								<div>
									<h4>{classes[clazz].Title}</h4>
								</div>
							</div>
						))}
				   </div>
				</div>
			</div>
			)
 	
 	


	}
}

const condition = authUser => authUser && (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ClassesPage = withFirebase(withAuthorization(condition)(ClassesPageBase));

export default ClassesPage;