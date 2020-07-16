import React from 'react';
import ReactQuill from 'react-quill';
import './quill.snow.scss';



class TCSEditor extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			text:props.text,
			type:props.type,
			selectOptions:props.selectOptions,
			disabled:props.disabled,
			placeholder:props.placeholder,
			name:props.name,
			editing:false,
			dropdown:false
		}
		this.handleChange = this.handleChange.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleSelectChange = this.handleSelectChange.bind(this);
		this.handleTextChange = this.handleTextChange.bind(this);
		this.showDropdown = this.showDropdown.bind(this);
	}
	handleChange = value => {
		this.setState({text:value});
		this.props.onEditorChange(value);
	}
	handleSelectChange = event => {
		this.setState({text:event.target.value});
		this.props.onEditorChange(event.target.value);
	}
	handleTextChange = event=> {
		this.setState({text:event.target.value});
		this.props.onEditorChange(event.target.value);
	}
	
	componentWillReceiveProps(props){
		//if(this.state.text != props.text)
		this.setState({...this.props,...props});
	}
	handleEdit(){
		const {editing} = this.state;
		this.setState({editing:!editing});
	}
	handleSave(){
		const {editing,text} = this.state;
		this.setState({editing:!editing});
		this.props.onEditorSave(text);
	}
	showDropdown() {
		const {dropdown} = this.state;
		this.setState({dropdown:!dropdown})
		if (dropdown) {
			console.log('hey')
		} else {
			console.log('heyo')
		}
	}

	render(){
		const {className} = this.props;
		const {text,type,selectOptions,disabled,placeholder,name,editing,dropdown} = this.state;
		if(!!disabled){
			return (
				<div className={'field ' + className} >
					<div name={name} dangerouslySetInnerHTML={{__html:text}}/>
				</div>
			)
		}
		else if(!disabled && !editing){
			if (this.props.type==='steparoo') {
				return (
					<div className={'field ' + className}>
	
						<div name={name} dangerouslySetInnerHTML={{__html:text}}/>
						{!dropdown && (<img className="edit" onClick={this.showDropdown} src="/images/gear.png"/>)}
						{dropdown &&  (
						<div>
					<img className="edit" onClick={this.handleEdit} src="/images/edit.png"/>

						<button className="add" onClick={this.props.addStepHandler}>+</button>
						</div>)}
						{this.props.stepCount > 1 && (
					    <img onClick={this.props.deleteStepHandler} src="/images/delete.png"/> 
						)}
					</div>
				)
			}
			return (
				<div className={'field ' + className}>

					<div name={name} dangerouslySetInnerHTML={{__html:text}}/>
					<img className="edit" onClick={this.handleEdit} src="/images/edit.png"/>

				</div>
			)
		}
		else if(!disabled && editing && type==='select' && !!selectOptions){
			return (
				<div className={'field ' + className} >

					<select value={text} onChange={this.handleSelectChange} onBlur={this.handleSelectChange}>
 						{selectOptions.map(option=>(
 							<option value={option}>{option}</option>
 						))}
 					</select>
					<button onClick={this.handleSave}>Save</button>

				</div>
			)
		}
		else if(!disabled && editing && type==='plain'){
			return (
				<div className={'field ' + className} >

					<input type="text" value={text} onChange={this.handleTextChange} onBlur={this.handleTextChange}/>
 						
					<button onClick={this.handleSave}>Save</button>

				</div>
			)
		}
		return (
			<div className={'field ' + className}>

				<ReactQuill theme={'snow'} placeholder={this.props.placeholder} value={this.state.text} onChange={this.handleChange}/>
				<button onClick={this.handleSave}>Save</button>
			</div>
			)
	}
}
export default TCSEditor;