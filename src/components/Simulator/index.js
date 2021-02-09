import React from 'react';


import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTER from '../../constants/filter';
import AceEditor from "react-ace";
import { v4 as uuidv4 } from 'uuid';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
// import "ace-builds/src-noc onflict/mode-css";
import "ace-builds/src-noconflict/theme-twilight";


class Simulator extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:false,
 		loadHover:false,
 		saving:false,
 		saveFilename:new Date().toDateString(),
 		errors:{},
 		code: '// type your code...',
 		html: '<!--type your html...-->',
 		css: '/*type your css...*/'
 		
 	}

 	this.onCodeEditorChange = this.onCodeEditorChange.bind(this);
 	this.onHTMLEditorChange = this.onHTMLEditorChange.bind(this);
 	this.onCSSEditorChange = this.onCSSEditorChange.bind(this);
 	this.onCodeEditorMount = this.onCodeEditorMount.bind(this);
 	this.onHTMLEditorMount = this.onHTMLEditorMount.bind(this);
 	this.onCSSEditorMount = this.onCSSEditorMount.bind(this);
 	this.saveOnClick = this.saveOnClick.bind(this);
 	this.saveFilenameOnChange = this.saveFilenameOnChange.bind(this);
 	this.loadOnClick = this.loadOnClick.bind(this);
 	this.loadOnHover = this.loadOnHover.bind(this);
 	this.loadOnLeave = this.loadOnLeave.bind(this);

 }
 
 componentDidMount(){
 	const {code} = this.state;


 	this.setState({ loading: false });
 	
 }
 componentWillUnmount(){
 }
 onCodeEditorMount(event){
 	console.log(event)
 }
 onCodeEditorChange(value){
 	const {code} = this.state;
 	if(code !== value)
 		this.setState({code:value});
 }
 onHTMLEditorMount(event){
 	console.log(event)
 }
 onHTMLEditorChange(value){
 	const {html} = this.state;
 	if(html !== value)
 		this.setState({html:value});
 }
 onCSSEditorMount(event){
 	console.log(event)
 }
 onCSSEditorChange(value){
 	const {css} = this.state;
 	if(css !== value)
 		this.setState({css:value});
 }
saveFilenameOnChange(value){
	const {saveFilename} = this.state;
 	if(saveFilename !== value)
 		this.setState({saveFilename:value});
}
 saveOnClick(){
 	const {saveFilename, errors,code,html,css} = this.state;
 	const {authUser} = this.props;
 	if(saveFilename.length > 5){
 		delete errors['filename'];
 		var id = uuidv4();
 		authUser.snippets[id] = {
 			Title:saveFilename,
 			id:id,
 			code:code,
 			html:html,
 			css:css

 		}
 		this.props.firebase.profile(authUser.uid).child('snippets').set({
	 		...authUser.snippets
	 	})
 		.then(()=>{
 			console.log("Successfully Saved Progress");
 			
 			this.props.setGlobalState({
	          messages:[{

	            html:`SAVE.<span class="green">GOOD</span>`,
	            type:true},{

	            html:`Press any key to continue...`,
	            type:false,

	            }],
	          showMessage:true
	        });
 		})
 		.catch(error=>console.log(error));
 		

 	}
 	else{
 		errors['filename'] = 'FILENAME.<span class="red">TOOSHORT</span>';
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
 loadOnHover(){
 	this.setState({loadHover:true})

 }
 loadOnLeave(){
 	this.setState({loadHover:false})
 }
 loadOnClick(event){
 	const {authUser} = this.props;
 	const {target} = event;
 	this.setState({loadHover:false},()=>{
 		var snippet = authUser.snippets[target.id];
 		this.setState({code:snippet.code,html:snippet.html,css:snippet.css})
 	})

 }
 render(){
 	
 	const {code,html,css,saveFilename,loadHover,loading,saving} = this.state;
 	const {authUser} = this.props;
 	const renderBody = html + '<script type="text/javascript">' + code + '</script><style>' + css + '</style>';

 	return (
 		<div id="simulator">
 			<div id="tabs">
 				<div id="javascript">Javascript</div>
 				<div id="html">HTML</div>
 				<div id="css">CSS</div>
 				<div onClick={this.saveOnClick} id="save"><input onChange={this.saveFilenameOnChange} id="save-filename" type="text" value={saveFilename}/>Save</div>
 				<div onMouseEnter={this.loadOnHover} onMouseLeave={this.loadOnLeave} id="load">
 					{!loadHover && (
 						<div>Load</div>
 					)}
 					{loadHover && !!authUser && !!authUser.snippets && Object.keys(authUser.snippets).length > 0 && Object.keys(authUser.snippets).map(snippet=>(
 						
 							<div onClick={this.loadOnClick} id={authUser.snippets[snippet].id}>{authUser.snippets[snippet].Title}</div>
 						
 					))}
 				</div>
 			</div>
			 <div className="coding-area">
 			<AceEditor
 				placeholder="Type your code here..."
 				mode="javascript"
 				theme="twilight"
 				onChange={this.onCodeEditorChange}
 				onLoad={this.onCodeEditorMount}
 				highlightActiveLine={true}
 				value={code}
 				name="code-space"
 				editorProps={{}}

 				enableBasicAutocompletion={true}
			    enableLiveAutocompletion={true}
			    enableSnippets={true}
 				/>
 			<AceEditor
 				placeholder="Type your HTML here..."
 				mode="html"
 				theme="twilight"
 				onChange={this.onHTMLEditorChange}
 				onLoad={this.onHTMLEditorMount}
 				highlightActiveLine={true}
 				value={html}
 				name="html-space"
 				editorProps={{}}
 				enableBasicAutocompletion={true}
			    enableLiveAutocompletion={true}
			    enableSnippets={true}
 				/>
 			<AceEditor
 				placeholder="Type your CSS here..."
 				mode="css"
 				theme="twilight"
 				onChange={this.onCSSEditorChange}
 				onLoad={this.onCSSEditorMount}
 				highlightActiveLine={true}
 				value={css}
 				name="css-space"
 				editorProps={{}}
 				enableBasicAutocompletion={true}
			    enableLiveAutocompletion={true}
			    enableSnippets={true}
 				/>
				 </div>
 			<div id="render-space">
 				<iframe sandbox="allow-scripts" srcdoc={renderBody}/>



 				
 			</div>
 		</div>

 	)


 	
}
}
export default withFirebase(withAuthentication(Simulator));