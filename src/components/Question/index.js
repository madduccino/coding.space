import React from 'react';


import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTERS from '../../constants/jf_filter';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';


class Question extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:true,
 		question: [],
 		profiles:[],
 		replyBody:'',
 		errors:{},


 		
 	}
 	//console.log("hiya");
 	this.tagSelectionOnChange = this.tagSelectionOnChange.bind(this);

 	this.tagOnClick = this.tagOnClick.bind(this);
 	this.saveChangesHandler = this.saveChangesHandler.bind(this);
 	this.handleReplyOnChange = this.handleReplyOnChange.bind(this);
 	this.handleReplyOnSave = this.handleReplyOnSave.bind(this);
 	this.deleteQuestion = this.deleteQuestion.bind(this);

 }
 tagSelectionOnChange(event){
 	const {question} = this.state;
 	if(!Object.keys(question.tags).includes(event.target.value)){

 		question.tags[event.target.value] = event.target.value;
 		this.setState({question:question},this.saveChangesHandler);
 	}
 	
 }
 tagOnClick(text){
 	const {question} = this.state;
 	if(Object.keys(question.tags).includes(text))
 	{
 		delete question.tags[text];
 		this.setState({question:question},this.saveChangesHandler);
 		
 	}

 }
 componentDidMount(){

 	const {key} = this.props.match.params;

 	this.props.firebase.question(key).on('value', snapshot => {
 		const questionObj = snapshot.val();
 		if(!questionObj.tags)
 			questionObj.tags = {};

 		this.props.firebase.profiles().once('value')
 			.then(snapshot2=>{
 				const profiles = snapshot2.val();
 				this.setState({
		 			question: questionObj,
		 			profiles:profiles,
		 			loading:false,
		 		})

 			})
 		
 	})
 	
 }
 componentWillUnmount(){
 	this.props.firebase.questions().off();

 }
 handleReplyOnChange(value){
 	const {question,errors,replyBody} = this.state;
 	const {authUser} = this.props;
 	if(replyBody !== value){
 		if(value.length < 10){
 			errors["REPLY_LENGTH"] = 'REPLY.<span class="red">ISTOOSHORT</span>';
 		}
 		else
 			delete errors["REPLY_LENGTH"];
 		this.setState({
 			replyBody:value,
 			errors:errors
 		})
 	}

 }
 handleReplyOnSave(event){
 	const {question,errors,replyBody} = this.state;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	if(Object.values(errors).length === 0){
		var reply = {};
		reply.Author = authUser.key;
		reply.Date = new Date().toString();
		reply.Body = replyBody;
		reply.key = uuidv4();
		question.LastModified = reply.Date;
		question.replies[reply.key] = reply;
		
 		this.props.firebase.question(key).set({
	 		...question
	 	})
 		.then(()=>{
 			console.log("Successfully Saved Reply");
 			
 			/*this.props.setGlobalState({
 				messages:[{

 					html:`REPLY.<span class="green">GOOD</span>`,
 					type:true},{

 					html:`Press any key to continue...`,
 					type:false,

 					}],
 				showMessage:true
 			});*/
 			window.location.reload();
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
			
		});
	}

 }
 saveChangesHandler(event){
 	const {key} = this.props.match.params;
 	this.props.firebase.question(key).set({
 		...this.state.question
 	})
 		.then(()=>{
 			console.log("Successfully Saved");

 		})
 		.catch(error=>console.log(error));

 }
 deleteQuestion(){
 	const {question} = this.state;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	
	question.Status = "ARCHIVED";
		
		this.props.firebase.question(key).set({
 		...question
 	})
	.then(()=>{
		console.log("Successfully Deleted");
		
		/*this.props.setGlobalState({
			messages:[{

				html:`REPLY.<span class="green">GOOD</span>`,
				type:true},{

				html:`Press any key to continue...`,
				type:false,

				}],
			showMessage:true
		});*/
		//window.location.reload();
	})
	.catch(error=>console.log(error));
	
 }
 render(){
 	const {question,profiles, loading, replyBody} = this.state;
 	const {authUser} = this.props;
 	//console.log("hiya")
 	if(loading)
 		return <div>Loading ...</div>
 	return (
		<section id="question">

			<div className="main">
				<div className="sidebar">
				{!!authUser && !!authUser.roles['ADMIN'] && (
				<button onClick={this.deleteQuestion}>Delete Question (ADMIN)</button>
			)}
				<h2 dangerouslySetInnerHTML={{__html:question.Title}} />
		
			<div className="tags">
			    
			    {!!authUser && (!!authUser.roles['ADMIN'] || !!authUser.roles['TEACHER']) && !Object.keys(question.tags).every(tag=>Object.keys(FILTERS).includes(tag)) && (
					<select onChange={this.tagSelectionOnChange}>
				    	{Object.keys(FILTERS).filter(f=>!Object.keys(question.tags).includes(f)).map(tagName=><option value={tagName}>{tagName}</option>)}
				    </select>
			    )}
			    
			    
			</div>	

		    {Object.keys(question.tags).length > 0 && (
		    	<div className="filter-categories">
		    		{Object.keys(question.tags).map(f=>(
		    			<a onClick={()=>(!!authUser.roles['ADMIN'] || !!authUser.roles['TEACHER']) && this.tagOnClick(f)}>{f}</a>
		    		))}
		    	</div>
		    )}
					</div>	
			<div className="main-content">	

				{!!question && (

					
					<div id={question.key}>
						<h1 dangerouslySetInnerHTML={{__html:question.Title}}/>
						{!!question.replies && Object.keys(question.replies).sort(reply=>question.replies[reply].Date).reverse().map(reply=>(
							<div class="reply" id={question.replies[reply].key}>
								<div class="author">{profiles[question.replies[reply].Author].DisplayName}</div>
								<div class="date">{new Date(question.replies[reply].Date).toDateString()}</div>
								<div class="body" dangerouslySetInnerHTML={{__html:question.replies[reply].Body}}/>
							</div>

						))}
						{!!authUser  &&(
							<div id="reply">

									<h3>Reply</h3>
									<TCSEditor 
										disabled={false}
										className='reply-body' 
										type='rich'
										editing={true}
										onEditorChange={this.handleReplyOnChange} 
										onEditorSave={this.handleReplyOnSave} 
										placeholder={'Your reply...'} 
										text={replyBody}/>	
							


							</div>
						)}
						
						


					</div>
				)}
			</div>

			</div>
    	</section>
	)
  }
}
export default withFirebase(withAuthentication(Question));