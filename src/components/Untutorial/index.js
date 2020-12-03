import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';
import * as FILTERS from '../../constants/filter';
import { Link } from 'react-router-dom';

class UntutorialPageBase extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			authUser:null,
			loading:true,
			untutorial: {},
			errors:{},
			progress:null,
			dirty:false,
			uploading:false,
			uploadPercent:0,
            showiframe: true


		}
		
		this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
		this.handleStatusOnSave = this.handleStatusOnSave.bind(this);
		this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
		this.handleStepThumbnailUpload = this.handleStepThumbnailUpload.bind(this);
		this.handleTitleOnChange = this.handleTitleOnChange.bind(this);
		this.handleTitleOnSave = this.handleTitleOnSave.bind(this);
		this.handleDescriptionOnChange = this.handleDescriptionOnChange.bind(this);
		this.handleDescriptionOnSave = this.handleDescriptionOnSave.bind(this);
		this.handleLevelOnChange = this.handleLevelOnChange.bind(this);
		this.handleLevelOnSave = this.handleLevelOnSave.bind(this);
		this.handleStepTitleOnChange = this.handleStepTitleOnChange.bind(this);
		this.handleStepTitleOnSave = this.handleStepTitleOnSave.bind(this);
		this.handleStepOnChange = this.handleStepOnChange.bind(this);
		this.handleStepOnSave = this.handleStepOnSave.bind(this);
		this.addStepHandler = this.addStepHandler.bind(this);
		this.deleteStepHandler = this.deleteStepHandler.bind(this);
		this.saveChangesHandler = this.saveChangesHandler.bind(this);
		this.saveProgressHandler = this.saveProgressHandler.bind(this);
		this.validateTitle = this.validateTitle.bind(this);
		this.validateStatus = this.validateStatus.bind(this);
		this.validateDescription = this.validateDescription.bind(this);
		this.handlePCategoryOnChange = this.handlePCategoryOnChange.bind(this);
		this.handleCategoryValidate = this.handleCategoryValidate.bind(this);
		this.handleCategoryOnClick = this.handleCategoryOnClick.bind(this);
		this.handleProgressURLOnChange = this.handleProgressURLOnChange.bind(this);
		this.handleProgressURLOnSave = this.handleProgressURLOnSave.bind(this);
		this.validateLevel = this.validateLevel.bind(this);
		this.validateStep = this.validateStep.bind(this);
		this.loadProgress = this.loadProgress.bind(this);
        this.deleteProjectHandler = this.deleteProjectHandler.bind(this);
		this.studentApprove = this.studentApprove.bind(this);


		
		//this.onChange = editorState => this.setState({editorState});
		//console.log("hiya");

	}
	handleMouseEnter = (target) => {

		if(this.state.canEdit){
			return; //replace control with rich text editor
		}
	}


	handleClick = (e) => {
      const {showiframe} = this.state;
		if (e.target.parentNode.className ==="main") {
         this.setState({showiframe: false})
		}
	}

	componentDidMount(){
		//console.log(this.authUser);
		document.body.addEventListener('click', this.handleClick);

		const {key} = this.props.match.params;

		this.props.firebase.untutorial(key).on('value', snapshot => {
			const untutorial = snapshot.val();
			this.props.firebase.profile(untutorial.Author).once('value')
				.then(snapshot2 => {
					const author = snapshot2.val();
					untutorial.Author = author;
					this.setState({
						untutorial: untutorial,
						loading:false
					},()=>this.props.location.search.includes("loadProgress") ? this.loadProgress() : null)
				})
			
			

			

			
		})


	}
	loadProgress(){
		const {authUser} = this.props;
		const {untutorial,showiframe} = this.state;
		const {key} = this.props.match.params;
		if(!!authUser){
			this.props.firebase.progress(authUser.uid,untutorial.key).on('value', snapshot => {
				if(snapshot.exists()){
					let progress = snapshot.val();
					if(!progress.steps)
						progress.steps = [];
					this.setState({progress:progress});
				} else {
					let progress = {
						Status:"DRAFT",
						steps:[],
						LastModified:Date.now(),
						profile:authUser.uid,
						untut:key
					}
					untutorial.steps.forEach((step,i)=>{
						progress.steps.push({Status:'DRAFT',Comments:''});
					})
					snapshot.ref.set({...progress})
					.then(()=>{
						this.setState({progress:progress});
					})
					

				}
				
			})
			
			
				
			
			
		}
        if (showiframe) this.setState({showiframe: false})					
	}
	componentWillUnmount(){
		//this.props.firebase.proj().off();
		this.props.firebase.untutorial().off();
	}
	handleThumbnailUpload(event){
		
		var file = event.target.files[0];
		var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
		var oCopy = this.state.untutorial;
		const {authUser} = this.props;
		if(authUser && !!authUser.roles['STUDENT'])
			oCopy.Status = 'DRAFT';
		oCopy.ThumbnailFilename = uuidv4() + '.' + ext;

		var storageRef = this.props.firebase.storage.ref('/public/' + oCopy.Author.key + '/' + oCopy.ThumbnailFilename);
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
				this.setState({uploadPercent:0,uploading:false,untutorial:oCopy,dirty:true},this.saveChangesHandler)

			})


	}
	handleStepThumbnailUpload(event,step){
		
		var file = event.target.files[0];
		var ext = file.name.substring(file.name.lastIndexOf('.') + 1);
		var oCopy = this.state.untutorial;
		const {authUser} = this.props;
		if(authUser && !!authUser.roles['STUDENT'])
			oCopy.Status = 'DRAFT';
		oCopy.steps[step].ThumbnailFilename = uuidv4() + '.' + ext;

		var storageRef = this.props.firebase.storage.ref('/public/' + oCopy.Author.key + '/' + oCopy.steps[step].ThumbnailFilename);
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
				this.setState({uploadPercent:0,uploading:false,untutorial:oCopy,dirty:true}, this.saveChangesHandler)

			})


	}
	handleTitleOnChange(value){
		var oCopy = this.state.untutorial;
		if(value !== oCopy.Title){
			oCopy.Title = value;
			const {authUser} = this.props;
			if(authUser && !!authUser.roles['STUDENT'])
				oCopy.Status = 'DRAFT';
			this.setState({untutorial:oCopy,dirty:true});
			this.validateTitle();
		}
		
		
	}
	handleTitleOnSave(value){
		this.saveChangesHandler();
	}
	validateTitle(){
		const {untutorial,errors} = this.state;
		const {Title} = untutorial;
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
	handleDescriptionOnChange(value){
		var oCopy = this.state.untutorial;
		if(value !== oCopy.Description){
			oCopy.Description = value;
			const {authUser} = this.props;
			if(authUser && !!authUser.roles['STUDENT'])
				oCopy.Status = 'DRAFT';
			this.setState({untutorial:oCopy,dirty:true});
			this.validateDescription();
		}
		
		
	}
	handleDescriptionOnSave(value){
		this.saveChangesHandler();
	}
	validateDescription(){
		const {untutorial,errors} = this.state;
		const {Description} = untutorial;
		const text = Description.replace(/<(.|\n)*?>/g, '').trim();
		if(text===''){

			errors['Description'] = 'DESCRIPTION.<span class="red">ISREQUIRED</span>';
		}
		if(text.length < 20){

			errors['Description'] = 'DESCRIPTION.<span class="red">ISTOOSHORT</span>';
		}
		else{
			delete errors['Description'];
		}
		this.setState({errors:errors});

	}
	handleStatusOnChange(value){
		var oCopy = this.state.untutorial;
		console.log(oCopy.Status)
		if(value !== oCopy.Status){
			oCopy.Status = value;
			this.setState({untutorial:oCopy,dirty:true});
			this.validateStatus();
		}
		
		
	}
	handleStatusOnSave(event){
		this.saveChangesHandler();
	}
	validateStatus(){
		const {untutorial,errors} = this.state;
		const {Status} = untutorial;
		if(!["DRAFT","APPROVED"].includes(Status)){
			errors['Status'] = 'STATUS.<span class="red">ISINVALID</span>'; 		
		}
		else{
			delete errors['Status'];
		}
		this.setState({errors:errors});
	}
	handlePCategoryOnChange(event){
	 	const {untutorial} = this.state;
	 	if(event.target.value != '-1'){
	 		untutorial.Categories[event.target.value] = event.target.value;
			 this.setState({untutorial:untutorial},this.handleCategoryValidate);	
			 console.log(event.target.value)
			 console.log(this.state.untutorial)
	 	}
	}
	handleCategoryOnClick(text){
		console.log(text)
	 	const {untutorial} = this.state;
	 	delete untutorial.Categories[text];
	 	this.setState({untutorial:untutorial},this.handleCategoryValidate);

	}
	handleCategoryValidate(){
	 	const {untutorial,errors} = this.state;
	 	if(Object.keys(untutorial.Categories).length < 2){
	 		errors["Categories"] = 'CATS.<span class="red">GR8TR.THAN.2.REQUIRED</span>';
	 	}
	 	else
	 		delete errors["Categories"];
	 	this.setState({errors:errors});
	}
	handleLevelOnChange(value){
		var oCopy = this.state.untutorial;
		if(value !== oCopy.Level){
			oCopy.Level = value;
			const {authUser} = this.props;
			if(authUser && !!authUser.roles['STUDENT'])
				oCopy.Status = 'DRAFT';
			this.validateLevel();

			this.setState({untutorial:oCopy,dirty:true});
			
		}
		
		
	}
	handleLevelOnSave(event){
		this.saveChangesHandler();
	}
	validateLevel(){
		const {untutorial,errors} = this.state;
		const {Level} = untutorial;
		if(isNaN(Level)){
			errors['Level'] = 'LEVEL.<span class="red">ISINVALID</span>'; 		
		}
		if(![1,2,3,4,5,6].includes(parseInt(Level))){

			errors['Level'] = 'LEVEL.<span class="red">ISOUTSIDERANGE</span>';
		}
		else{
			delete errors['Level'];
		}
		this.setState({errors:errors});

	}
	handleStepTitleOnChange(value,step){
		var oCopy = this.state.untutorial;
		if(value !== oCopy.steps[step].Title){
			oCopy.steps[step].Title = value;
			const {authUser} = this.props;
			if(authUser && !!authUser.roles['STUDENT'])
				oCopy.Status = 'DRAFT';
			this.setState({untutorial:oCopy,dirty:true});
			//this.validateStep(step);
		}
	}
	handleStepTitleOnSave(value,step){
		this.saveChangesHandler();
	}
	handleStepOnChange(value,step){
		var oCopy = this.state.untutorial;
		if(value !== oCopy.steps[step].Description){
			oCopy.steps[step].Description = value;
			const {authUser} = this.props;
			if(authUser && !!authUser.roles['STUDENT'])
				oCopy.Status = 'DRAFT';
			this.setState({untutorial:oCopy,dirty:true});
			this.validateStep(step);
		}

		
	}
	handleStepOnSave(value,step){
		this.saveChangesHandler();
	}
	validateStep(index){
		const {untutorial,errors} = this.state;
		const Step = untutorial.steps[index];
		const text = Step.Description.replace(/<(.|\n)*?>/g, '').trim();
		if(text===''){
		errors['STEP'+index] = 'STEP.<span class="orange">'+index+'</span>.<span class="red">ISREQUIRED</span>'; 		
		}
		if(text.length < 20){

			errors['STEP'+index] = 'STEP.<span class="orange">'+index+'</span>.<span class="red">ISTOOSHORT</span>';
		}
		else{
			delete errors['STEP' + index];
		}
		this.setState({errors:errors});
	}
	validateProjectURL(){
		const {untutorial,errors,project} = this.state;
		const {authUser} = this.props;
		
		
		if(project.URL===''){
			errors['PROJECT_URL'] = 'PROJECT_URL.<span class="red">ISREQUIRED</span>'; 		
		}
		else if(!project.URL.match(/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i)){
			errors['PROJECT_URL'] = 'PROJECT_URL.<span class="red">ISINVALID</span>'; 
		}
		else{
			delete errors['PROJECT_URL'];
		}
		this.setState({errors:errors});
	}
	deleteStepHandler(event,key){
		var oCopy = this.state.untutorial;
		const {authUser} = this.props;
		if(authUser && !!authUser.roles['STUDENT'])
			oCopy.Status = 'DRAFT';
		delete oCopy.steps[key];
		//shift steps up
		var newSteps = [];
		var steps  = Object.values(oCopy.steps);
		steps.forEach((step,i)=>{
			newSteps[i] = step;
		})
		oCopy.steps = newSteps;

		this.setState({untutorial:oCopy,dirty:true},this.saveChangesHandler);
		console.log("Delete Step");
		console.log(key);
	}
	addStepHandler(event){
		var oCopy = this.state.untutorial;
		const {authUser} = this.props;
		if(authUser && !!authUser.roles['STUDENT'])
			oCopy.Status = 'DRAFT';
		oCopy.steps[Math.max(...Object.keys(oCopy.steps)) + 1] = {Description:''};
		this.setState({untutorial:oCopy,dirty:true},this.saveChangesHandler);
		console.log("Add Step");
	}
	deleteProjectHandler(){
		const {key} = this.props.match.params;
		this.props.firebase.untutorial(key).remove();
		window.location = ROUTES.LANDING;
		
	}
	saveChangesHandler(event){

		const {untutorial,  loading, author,errors} = this.state;
		const {Title,Description, Level, steps} = untutorial;
		const {authUser} = this.props;
		const {key} = this.props.match.params;
		const stepCount = (!!untutorial&& !!untutorial.steps) ? Object.keys(untutorial.steps).length : 0;
		
		if(Object.values(errors).length === 0){
			untutorial.LastModified = Date.now();
			untutorial.Author = untutorial.Author.key;
			this.props.firebase.untutorial(key).set({
				...untutorial
			})
			.then(()=>{
				console.log("Successfully Saved");
				this.setState({dirty:false})
				// /*this.props.setGlobalState({
				// 	messages:[{

				// 		html:`SAVE.<span class="green">GOOD</span>`,
				// 		type:true},{

				// 		html:`Press any key to continue...`,
				// 		type:false,

				// 		}],
				// 	showMessage:true
				// });*/
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
	saveProgressHandler(event){

		const {untutorial,errors, progress} = this.state;

		const {authUser} = this.props;
		const {key} = this.props.match.params;
	
		
		if(Object.values(errors).length === 0){
			//progress.Level = untutorial.Level;
			progress.LastModified = Date.now();
			this.props.firebase.progress(authUser.uid,untutorial.key).set({
				...progress
			})
			.then(()=>{
				console.log("Successfully Saved Progress");
				
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
				
			});
		}

		
		console.log("Save Changes");
	}
	handleProgressURLOnChange(value){
		const {progress} = this.state;
		var pCopy = progress;
		pCopy.URL = value;
		this.setState({progress:pCopy});
	}
	handleProgressURLOnSave(value){
		this.saveProgressHandler();

	}
	studentApprove(step){
		const {progress,untutorial} = this.state;
		var pCopy = progress;
		if(!progress.steps[step])
			progress.steps[step]={Status:'PENDING',Comments:''};
		progress.steps[step].Status = 'PENDING';
		
		//progress.nextStep = untutorial.steps.findIndex((stepf,i)=>!progress.steps[i] || progress.steps[i].Status == 'DRAFT')+1;

		
		
		this.setState({progress:progress},this.saveProgressHandler);

	}
	render(){
		
		const {untutorial, loading, author,progress,showiframe} = this.state;
		const {Title,Description, Level, steps} = untutorial;
		const {authUser} = this.props;
		const {key} = this.props.match.params;

		var progressSteps = null;
		if(!!progress)
			progressSteps = progress.steps;
		var stepCount = 0;
		if(!!untutorial && !!untutorial.steps)
			stepCount = untutorial.steps.length;
		var nextStep = -1;
		if(!!progress)
			nextStep = progress.nextStep;
		console.log();
		if(nextStep > stepCount)
			nextStep = 0;
		
		//console.log(Object.keys(project));
		if(loading)
			return (<div className="loading">Loading ...</div>);
		

		//can edit

		return (
		<section id="untutorial">
		  <div className="thumbnail hero">
		  {!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (	
		    <label for="files" className="upload">
			<input id="files" type="file" onChange={this.handleThumbnailUpload}/>
		</label>
		  )} 
		  {this.state.uploading && (
			<progress value={this.state.uploadPercent} max="100"/>
		  )}
		  {!!untutorial.ThumbnailFilename && !!untutorial.ThumbnailFilename.length != 0 && !this.state.uploading &&(
		    <LazyImage file={this.props.firebase.storage.ref('/public/' + untutorial.Author.key + '/' + untutorial.ThumbnailFilename)}/>
		  )}
		  </div>
		  <div className="workOnProject">
			  {!!progress && progress.Status == 'APPROVED' &&(
			  <Link to={ROUTES.UNIVERSE + '/' + progress.untut}>
			    GREAT JOB! You finished this project!  Publish to the UNIVERSE!
			  </Link>
			  )}
			  {!!progress && progress.Status == 'PENDING' && (
			    <h3>Your teacher is reviewing your project! Take it easy!</h3>
			  )}
			  {!!progress && progress.Status == 'DRAFT' && nextStep>0 && (
			    <h3>Keep it Up! You're on Step {nextStep}!</h3>
			  )}
			</div>
				
		  <div className="main">		 
	
			<div className={showiframe ? 'iframe-on' : "iframe-off"}>
			  <div className="popup">
			  {showiframe && (
			  <>
                <div>
				  <h3 dangerouslySetInnerHTML={{__html:untutorial.Title}}/>
			      <div dangerouslySetInnerHTML={{__html:untutorial.Description}}/>
				  <button onClick={this.loadProgress}>Code This Project</button>	
				</div>
				<Link style={{position:"absolute",left:"20px",top:"20px",color:"black"}} to={ROUTES.LAUNCHPAD}><i className="fa fa-undo"></i></Link>
				<Link style={{position:"absolute",right:"20px",top:"20px",color:"black"}} onClick={()=> this.setState({showiframe:false, progress:null})}><i className="fa fa-close"></i></Link>
			  </>
			  )}
			  <div onClick={()=> this.setState({showiframe:!showiframe})} className="toggle-iframe">
			      <i className="fa fa-code"></i>
			  </div>
{/* 			
				{!!authUser && !progress && (
				<button onClick={this.loadProgress}>Code This Project</button>
				)} */}
			</div>
			</div>
			<div className="main-content">
			  {!!progress  && (
			    <TCSEditor 
			    disabled={false}
			    type={'plain'}
			    className="url"
			    onEditorChange={this.handleProgressURLOnChange}
			    onEditorSave={this.handleProgressURLOnSave}
			    placeholder={'Project URL...'} 
			    url={true}
			    buttonText={progress.URL ? 'Edit Link' : 'Add Link'}
				text={progress.URL}/>		
				)}
				<div className="steps">
				{!!untutorial && untutorial.steps.map((step,index) => (
				  <div className={"step " + ((!!progress && (progress.steps[index].Status == 'PENDING')) ? "" : "")}>
				  <div className="checkOff">
				    <div className={'step-title status'}>
					  Step {index+1}
					  {!!step.Title && !!step.Title.length && (
						<>:&nbsp;</>
					  )}
					  <TCSEditor
						disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
						type={'plain'}
						className={!!progress  ? 'no-button' : 'header'} 
						onEditorChange={(value)=>this.handleStepTitleOnChange(value,index)} 
						onEditorSave={(value)=>this.handleStepTitleOnSave(value,index)} 
						placeholder={'Step Title'}
						buttonText={!!progress  ? '' : 'Edit Title'} 
						text={!!untutorial.steps[index].Title ? untutorial.steps[index].Title : ""}/> 
						
						{(!!progress && !!progress.steps[index] && progress.steps[index].Status == 'DRAFT') ? (
							<div className="red"></div>
							) : (!!progress && !!progress.steps[index] && progress.steps[index].Status == 'PENDING') ? (
							<div className="yellow"></div>
							) : !!progress && (
							<div className="green"></div>
							)}
						</div>	
				  </div>
				  <div className={'step-content'}>	
					<TCSEditor
					disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
					type={'text'}
					className={!!progress ? 'no-button' : 'editor'}
					onEditorChange={(value)=>this.handleStepOnChange(value,index)} 
					onEditorSave={(value)=>this.handleStepOnSave(value,index)} 
					placeholder={'Step Description'}
					buttonText={!!progress ? '' : 'Edit Description'} 
					text={untutorial.steps[index].Description}/>
					{!!progress && !!progress.steps[index] && progress.steps[index].Comments != '' && (
						<div className={'comments'}>{progress.steps[index].Comments}</div>
							)}
							<div className="thumbnail">
								{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (		
								<label for={'step' + index + '-thumbnail-upload'} className="upload">
									<input id={'step' + index + '-thumbnail-upload'} type="file" onChange={(event)=>this.handleStepThumbnailUpload(event,index)}/>
								</label>
								)} 
								{this.state.uploading && (
								<progress value={this.state.uploadPercent} max="100"/>
								)}
								{!!untutorial.steps[index].ThumbnailFilename && !!untutorial.steps[index].ThumbnailFilename.length != 0 && !this.state.uploading &&(
								<LazyImage id={'step' + index + '-thumbnail'} file={this.props.firebase.storage.ref('/public/' + untutorial.Author.key + '/' + untutorial.steps[index].ThumbnailFilename)}/>
								)}
							</div>	
							{!!progress && (!progress.steps[index] || progress.steps[index].Status == 'DRAFT') && (
								<div>
									<button 
										disabled={false} 
										className={'done-button'}
										onClick={()=>this.studentApprove(index)}>Done</button>
								</div>
							)}
							{!!progress && (!progress.steps[index] || progress.steps[index].Status == 'PENDING') && (
							<div>
								<button 
									disabled={false} 
									className={'done-button'}
									onClick={()=>this.studentApprove(index)}>Teacher Reviewing!</button>
							</div>
							
						)}
						</div>
						{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (
						<button className="del" onClick={(event)=>this.deleteStepHandler(event,index)} text="Delete Step">Delete Step</button>
					)}	
								  
					</div>


			    ))}
			   <div class="addDelete">
				   <button onClick={(event)=>this.addStepHandler(event)} text="Add Step">Add Step</button>
				<button onClick={this.deleteProjectHandler}>Delete Untutorial</button>
				</div>
			  </div>
			</div>
		    <div className="sidebar">
			{!!progress && (
			<>	 				
			  {!!untutorial.Categories['SCRATCH'] && (
			  <a className="scratch" href='https://scratch.mit.edu' target='_Blank'><LazyImage file={this.props.firebase.storage.ref('/public/scratch.png')}/></a>
			  )}
			</>
			)}	
			<div className="container">	
			<div className={'titleStatus'}>
			<TCSEditor 
			disabled={!(authUser && !!authUser.roles['ADMIN'])}
			type={'text'}
			className={'title'}
			name={'title'}
			onEditorChange={this.handleTitleOnChange}
			onEditorSave={this.handleTitleOnSave}
			placeholder={'Step Description'} 
			text={untutorial.Title} />
			</div>		
			{/* {!!authUser && !progress && (
				<button className="checkout"
				onClick={this.loadProgress}>Get Coding!</button>
			)} */}
			</div>
			<div className="container">
		      Level:
		      <TCSEditor 
			  disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
			  type={'select'}
			  className="level"
			  selectOptions={["1","2","3","4","5","6"]}
			  onEditorChange={this.handleLevelOnChange}
			  onEditorSave={this.handleLevelOnSave}
			  placeholder={'Level'} 
			  text={untutorial.Level}/>
		    </div>	
			<div className="container">
			    <h3>by: <a href={'/profile/' + untutorial.Author.key} dangerouslySetInnerHTML={{__html:untutorial.Author.DisplayName}}/></h3>
		    
		    </div>	

			<div className="container">
				<TCSEditor 
				  disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
				  type={'text'}
				  onEditorChange={this.handleDescriptionOnChange}
				  onEditorSave={this.handleDescriptionOnSave}
				  placeholder={'Untutorial Description'} 
				  name={'description'}
				  text={untutorial.Description} />
				</div>	
				{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (
				<div className="container">
			        <h4>Status</h4>	
			        <TCSEditor 
			          disabled={!(authUser && !!authUser.roles['ADMIN'])}
			type={'select'}
			selectOptions={['DRAFT','APPROVED']}
			name={'status'}
			className={untutorial.Status === 'APPROVED' ? 'approved' : 'draft'}
			onEditorChange={this.handleStatusOnChange}
			onEditorSave={this.handleStatusOnSave}
			placeholder={'Status'} 
			text={untutorial.Status} />
		  </div>
				)}
				{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (	
				<div className="container">	
			      <h4>Tags</h4>
			       <div className="filter">
			        {Object.keys(untutorial.Categories).length != Object.keys(FILTERS).length && (
				      <select onChange={this.handlePCategoryOnChange}>
					<option value='-1'>-------</option>
					{Object.keys(FILTERS).filter(f=>!Object.keys(untutorial.Categories).includes(f)).map(catName=><option value={catName}>{FILTERS[catName]}</option>)}
				</select>
			        )}
				    <div className="filter-categories">
					{Object.keys(untutorial.Categories).map(f=>(
					  <a onClick={()=>this.handleCategoryOnClick(f)}>{FILTERS[f]}</a>
					))}
				</div>
			    
			</div>
			</div>
				)}
			  </div>
		  </div>	
		</section>
		)
	}
}

const ProjectPage = withFirebase(withAuthentication(UntutorialPageBase));

export default ProjectPage;	