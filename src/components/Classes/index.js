import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';



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
 	this.props.firebase.classes().off();
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
		 <section id="classes">
			<h1>My Classes</h1>
			{!!authUser && !!authUser.roles['ADMIN'] && (
					<a className="button" href={ROUTES.NEW_CLASS}>New Class</a>
				)}
			<div className="main">
					    {loading && <div>Loading ...</div>}
						{Object.keys(classes).filter(clazz=>classes[clazz].Status==='APPROVED' || (!!authUser && !!authUser.roles['ADMIN'])).map(clazz => (	
								<>
								<a id={clazz.key} href={'/classes/' + clazz} path={'/classes/' + classes[clazz].ThumbnailFilename}>
									<LazyImage file={this.props.firebase.storage.ref('/classes/' + classes[clazz].ThumbnailFilename)}/>
								
							 <div>
									<h4 className={'container'} dangerouslySetInnerHTML={{__html:clazz.Title}}/>
									{!!authUser && !!authUser.roles['ADMIN'] && clazz.Status != 'APPROVED' && (
										<h5>DRAFT</h5>
									)}
								</div> 
								</a>
							</>
						))}
				   </div>
			</section>
			)
 	
 	


	}
}

const condition = authUser => authUser && (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ClassesPage = withFirebase(withAuthentication(ClassesPageBase));

export default ClassesPage;