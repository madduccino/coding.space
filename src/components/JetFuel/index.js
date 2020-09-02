import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTERS from '../../constants/jf_filter';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';

class JetFuel extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:true,
 		questions: [],
 		profiles:[],
 		filter:[],
 		errors:{},
 		questionTitle:'',
 		questionBody:'',
 		textFilter:'',
 		
 	}
 	//console.log("hiya");
 	this.categoryFilterOnChange = this.categoryFilterOnChange.bind(this);
 	this.textFilterOnChange = this.textFilterOnChange.bind(this);
 	this.filterOnClick = this.filterOnClick.bind(this);
 	this.onQuestionTitleChange = this.onQuestionTitleChange.bind(this);
 	this.onQuestionBodyChange = this.onQuestionBodyChange.bind(this);
 	this.onQuestionSave = this.onQuestionSave.bind(this);

 }
 

 categoryFilterOnChange(event){
 	const {filter} = this.state;
 	if(event.target.value != '-1'){
 		filter.push(event.target.value);
 		this.setState({filter:filter});
 	}
 	
 }
 textFilterOnChange(event){

 	this.setState({textFilter:event.target.value});
 	this.forceUpdate();

 }
 filterOnClick(text){
 	const {filter} = this.state;
 	this.setState({filter:filter.filter(f=>f!==text)});

 }
 componentDidMount(){


 	this.props.firebase.questions().on('value', snapshot => {
 		const questionsObj = snapshot.val();
 		const questions = Object.keys(questionsObj).map(key =>({
 			...questionsObj[key],
 			key:key,
 		}))

 		this.props.firebase.profiles().once('value')
 			.then(snapshot2=>{
 				const profiles = snapshot2.val();
 				this.setState({
		 			questions: questions,
		 			profiles:profiles,
		 			loading:false,
		 		})

 			})
 		
 	})
 	
 }
 componentWillUnmount(){
 	this.props.firebase.questions().off();
 }
 onQuestionTitleChange(value){
	const {questionTitle,questionBody,errors} = this.state;
 	const {authUser} = this.props;
 	if(questionTitle !== value){
 		if(value.length < 10){
 			errors["QUESTION_TITLE_LENGTH"] = 'Q.TITLE.LENGTH.<span class="red">ISTOOSHORT</span>';
 		}
 		else
 			delete errors["QUESTION_TITLE_LENGTH"];
 		this.setState({
 			questionTitle:value,
 			errors:errors
 		})
 	}
 }
 onQuestionBodyChange(value){
 	const {questionTitle,questionBody,errors} = this.state;
 	const {authUser} = this.props;
 	if(questionBody !== value){
 		if(value.length < 20){
 			errors["QUESTION_BODY_LENGTH"] = 'Q.BDY.LENGTH.<span class="red">ISTOOSHORT</span>';
 		}
 		else
 			delete errors["QUESTION_BODY_LENGTH"];
 		this.setState({
 			questionBody:value,
 			errors:errors
 		})
 	}
 }
 onQuestionSave(){
 	const {questions,errors,questionTitle,questionBody} = this.state;
 	const {authUser} = this.props;
 	const {key} = this.props.match.params;
 	if(Object.values(errors).length === 0){
		var question = {};
		
		question.LastModified = new Date().toString();
		question.Status="APPROVED";
		question.Author = authUser.key;
		question.Title = questionTitle;
		//question.Body = questionBody;
		question.replies = {};
		question.key = uuidv4();
		var reply = {};
		reply.key = uuidv4();
		reply.Author = authUser.key;
		reply.Body = questionBody;
		reply.Date = question.LastModified;
		question.replies[reply.key] = reply;
		
 		this.props.firebase.question(question.key).set({
	 		...question
	 	})
 		.then(()=>{
 			console.log("Successfully Saved Question");
 			
 			/*this.props.setGlobalState({
 				messages:[{

 					html:`REPLY.<span class="green">GOOD</span>`,
 					type:true},{

 					html:`Press any key to continue...`,
 					type:false,

 					}],
 				showMessage:true
 			});*/
 			window.location = ROUTES.JETFUEL + '/' + question.key;
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

 }
 render(){
 	
 	const {questions,profiles, loading, filter, textFilter,questionTitle,questionBody} = this.state;
 	const selectedFilters = Object.keys(FILTERS).filter(v=>filter.includes(v));
 	const {authUser} = this.props;
 	if(loading)
 		return (<div className="loading">Loading...</div>);

 	return (
		<section id="jetfuel">
						

			<div className="main">
       		 <div className="sidebar">
				<div className="filter">
					{selectedFilters.length != Object.keys(FILTERS).length && (
						<select onChange={this.categoryFilterOnChange}>
							<option value="-1">Filter...</option>
							{Object.keys(FILTERS).filter(f=>!selectedFilters.includes(f)).map(filterName=><option value={filterName}>{filterName}</option>)}
						</select>
					)}
			    	<input type='text' onChange={this.textFilterOnChange} placeholder="Search..."/>
				</div>	
			    {selectedFilters.length > 0 && (
			    	<div className="filter-categories">
			    		{selectedFilters.map(f=>(
			    			<a onClick={()=>this.filterOnClick(f)}>{f}</a>
			    		))}
			    	</div>
			    )}
							{!!authUser  &&(
				<div id="new-question">
						<h3>Have a Question?</h3>
						<TCSEditor 
							disabled={false}
							className='new-question-title' 
							type='plain'
							save={false}
							editing={true}
							onEditorChange={this.onQuestionTitleChange} 
							placeholder={'New Question Title...'} 
							text={questionTitle}/>	
						<TCSEditor 
							disabled={false}
							className='new-question-body' 
							type='rich'
							editing={true}
							onEditorChange={this.onQuestionBodyChange} 
							onEditorSave={this.onQuestionSave}
							placeholder={'New Question Body...'} 
							text={questionBody}/>	
					


				</div>
			)}
			</div>	
			<div className="main-content">	
			{/* <h1>JetFuel Q&A</h1> */}
				{questions.filter(question=>
					question.Status === 'APPROVED' && 
					(filter.length === 0 || filter.filter(f=>!!question.tags && Object.keys(question.tags).includes(f)).length > 0) &&
					question.Title.toLowerCase().includes(textFilter.toLowerCase())).map(question => (

					<div id={question.key}>
						<a href={ROUTES.JETFUEL + '/' + question.key} >
							<div class="title" dangerouslySetInnerHTML={{__html:question.Title}}/>
							<div class="last-reply">{profiles[Object.values(question.replies).sort(reply=>reply.Date)[0].Author].DisplayName}</div>
							<div class="count">{Object.keys(question.replies).length}</div>
							<div class="last-reply-date">{new Date(question.LastModified).toDateString()}</div>
						</a>
					</div>
				))}
			</div>


			</div>

    </section>
	)
}
}
export default withFirebase(withAuthentication(JetFuel));