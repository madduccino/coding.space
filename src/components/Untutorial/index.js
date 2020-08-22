import React from 'react';
import LazyImage from '../LazyImage';
import { AuthUserContext } from '../Session';
import {withAuthentication} from '../Session';
import {withFirebase} from '../Firebase';
import TCSEditor from '../TCSEditor';
import { v4 as uuidv4 } from 'uuid';
import * as ROUTES from '../../constants/routes';

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
		this.handleStepOnChange = this.handleStepOnChange.bind(this);
		this.handleStepOnSave = this.handleStepOnSave.bind(this);
		this.addStepHandler = this.addStepHandler.bind(this);
		this.deleteStepHandler = this.deleteStepHandler.bind(this);
		this.saveChangesHandler = this.saveChangesHandler.bind(this);
		this.saveProgressHandler = this.saveProgressHandler.bind(this);
		this.validateTitle = this.validateTitle.bind(this);
		this.validateStatus = this.validateStatus.bind(this);
		this.validateDescription = this.validateDescription.bind(this);
		this.validateLevel = this.validateLevel.bind(this);
		this.validateStep = this.validateStep.bind(this);
		this.loadProgress = this.loadProgress.bind(this);

		this.studentApprove = this.studentApprove.bind(this);


		
		//this.onChange = editorState => this.setState({editorState});
		//console.log("hiya");

	}
	handleMouseEnter = (target) => {

		if(this.state.canEdit){
			return; //replace control with rich text editor
		}
	}
	componentDidMount(){
		//console.log(this.authUser);
		
		const {key} = this.props.match.params;

		this.props.firebase.untutorial(key).on('value', snapshot => {
			const untutorial = snapshot.val();
			this.props.firebase.profile(untutorial.Author).once('value')
				.then(snapshot2 => {
					const author = snapshot2.val();
					untutorial.Author = author;
					this.setState({
						untutorial: untutorial,
						loading:false,
					})
				})
			
			

			

			
		})


	}
	loadProgress(){
		const {authUser} = this.props;
		const {untutorial} = this.state;
		const {key} = this.props.match.params;
		if(!!authUser){
			this.props.firebase.progress(authUser.uid,untutorial.key).on('value', snapshot => {
				if(snapshot.exists()){
					let progress = snapshot.val();
					if(!progress.steps)
						progress.steps = {};
					this.setState({progress:progress});
				} else {
					let progress = {
						Status:"DRAFT",
						steps:{},
						LastModified:Date.now(),
						profile:authUser.uid,
						untut:key
					}
					snapshot.ref.set({...progress})
					.then(()=>{
						this.setState({progress:progress});
					})
					

				}
				
			})
			
			
				
			
			
		}

						
						
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
		if(![1,2,3,4,5,6].includes(Level)){

			errors['Level'] = 'LEVEL.<span class="red">ISOUTSIDERANGE</span>';
		}
		else{
			delete errors['Level'];
		}
		this.setState({errors:errors});

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
	deleteProjectHandler(value){
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
	studentApprove(step){
		const {progress} = this.state;
		var pCopy = progress;
		if(!progress.steps[step])
			progress.steps[step]={Status:'PENDING',Comments:''};
		progress.steps[step].Status = 'PENDING';

		
		
		this.setState({progress:progress},this.saveProgressHandler);

	}
	render(){
		
		const {untutorial, loading, author,progress} = this.state;
		const {Title,Description, Level, steps} = untutorial;
		const {authUser} = this.props;
		const {key} = this.props.match.params;

		var progressSteps = null;
		if(!!progress)
			progressSteps = Object.keys(progress.steps);
		var stepCount = 0;
		if(!!untutorial && !!untutorial.steps)
			stepCount = Object.keys(untutorial.steps).length;
		var studentCompleteSteps = 0;
		if(!!progress && !!progressSteps) 
			studentCompleteSteps = progressSteps.filter(step=>progress.steps[step].Status=='PENDING');
		var nextStep = 0;
		if(!!studentCompleteSteps)
			nextStep = Math.min(...Object.keys(untutorial.steps).filter(step=>!studentCompleteSteps.includes(step)))+1;
		console.log();
		if(nextStep > stepCount)
			nextStep = 0;
		
		//console.log(Object.keys(project));
		if(loading)
			return (<div>Loading ...</div>);
		

		//can edit

		return (
			<section id="untutorial">
				<div className="main">

					<div className="sidebar">
						<div className="sidebar-content">
							<div className={'container'} >
								<TCSEditor 
								disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
								type={'select'}
								className="level"
								selectOptions={["1","2","3","4","5","6"]}
								onEditorChange={this.handleLevelOnChange}
								onEditorSave={this.handleLevelOnSave}
								placeholder={'Level'} 
								text={`Level ${untutorial.Level}`}/>
							</div>
							<div className={'container titleStatus'}>
								<TCSEditor 
								disabled={!(authUser && !!authUser.roles['ADMIN'])}
								type={'text'}
								className={'title'}
								name={'title'}
								onEditorChange={this.handleTitleOnChange}
								onEditorSave={this.handleTitleOnSave}
								placeholder={'Step Description'} 
								text={untutorial.Title} />
								{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (		
									<TCSEditor 
									disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
									type={'select'}
									selectOptions={['DRAFT','APPROVED']}
									name={'status'}
									className={untutorial.Status === 'APPROVED' ? 'approved' : 'draft'}
									onEditorChange={this.handleStatusOnChange}
									onEditorSave={this.handleStatusOnSave}
									placeholder={'Status'} 
									text={untutorial.Status} />
								)}
							</div>
							<div className="container">
								<div className="thumbnail">
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
								{untutorial.Author.Status === 'APPROVED' &&(
									<div className={'container'}>
										<h3>by: <a href={'/profile/' + untutorial.Author.key} dangerouslySetInnerHTML={{__html:untutorial.Author.DisplayName}}/></h3>

									</div>
								)}
								
								<div className={'container'}>
									<TCSEditor 
									disabled={!(authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
									type={'text'}
									onEditorChange={this.handleDescriptionOnChange}
									onEditorSave={this.handleDescriptionOnSave}
									placeholder={'Untutorial Description'} 
									text={untutorial.Description}/>
								</div>
							</div>
						</div>
					</div>
					<div className="main-content">
						<div className="workOnProject">
							{!!authUser && !progress && (
								<button
								onClick={this.loadProgress}>Check Out</button>
							)}
							{!!progress && progress.Status == 'APPROVED' &&(
								<div>
									<h3>GREAT JOB! You finished this project!'</h3>
									<button onClick={()=>window.location = ROUTES.UNIVERSE + '/' + progress.untut}>Publish to the UNIVERSE!</button>
								</div>
							)}
							{!!progress && progress.Status == 'PENDING' && (
								<h3>Your teacher is reviewing your project! Take it easy!</h3>
							)}
							{!!progress && progress.Status == 'DRAFT' && !!nextStep && (
								<h3>Keep it Up! You're on Step {nextStep}!</h3>
							)}
							
				
						</div>		
						<div className={'container'}>
							{Object.keys(untutorial.steps).map(step => (
								<div className="step">
									<div className="checkOff">
										{!!progress && (!progress.steps[step] || progress.steps[step].Status == 'DRAFT') && (
											<div>
												
												
												<button 
													disabled={false} 
													onClick={()=>this.studentApprove(step)}>Done</button>
											</div>
											
										)}
										{!!progress && !!progress.steps[step] && progress.steps[step].Status == 'PENDING' && (
											<div>

												<img src='/images/coin.gif'/>
											</div>
										)}
										{!!progress && !!progress.steps[step] && progress.steps[step].Status == 'APPROVED' && (
											<div>

												<img src='/images/star-yellow.png'/>
											</div>
										)}
										<div>Step {parseInt(step)+1}</div>
									</div>
									<TCSEditor
										disabled={!(!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key))}
										type={'text'}
										onEditorChange={(value)=>this.handleStepOnChange(value,step)} 
										onEditorSave={(value)=>this.handleStepOnSave(value,step)} 
										placeholder={'Step Description'} 
										text={untutorial.steps[step].Description}/> 
									{!!progress && !!progress.steps[step] && progress.steps[step].Comments != '' && (
										<div className={'comments'}>{progress.steps[step].Comments}</div>
									)}
									<div className="step thumbnail">
										{!!authUser && (!!authUser.roles['ADMIN'] || authUser.uid===untutorial.Author.key) && (		
											<label for={'step' + step + '-thumbnail-upload'} className="upload">
												<input id={'step' + step + '-thumbnail-upload'} type="file" onChange={(event)=>this.handleStepThumbnailUpload(event,step)}/>
											</label>
										)} 
										{this.state.uploading && (
											<progress value={this.state.uploadPercent} max="100"/>
										)}
										{!!untutorial.steps[step].ThumbnailFilename && !!untutorial.steps[step].ThumbnailFilename.length != 0 && !this.state.uploading &&(
											<LazyImage id={'step' + step + '-thumbnail'} file={this.props.firebase.storage.ref('/public/' + untutorial.Author.key + '/' + untutorial.steps[step].ThumbnailFilename)}/>
										)}
									</div>	

								</div>

						

							))}
						</div>
					</div>
				</div>
			</section>
		)
	}
}

const ProjectPage = withFirebase(withAuthentication(UntutorialPageBase));

export default ProjectPage;