import React from 'react';
import ReactQuill from 'react-quill';
import './quill.snow.css';



class TCSEditor extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			text:props.text,
		}
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange = value => {
		this.setState({text:value});
		this.props.onEditorChange(this.state.text);
	}
	componentWillReceiveProps(props){
		if(this.state.text != props.text)
			this.setState({...this.props,...props});
	}

	render(){
		return (
			<ReactQuill theme={'snow'} value={this.state.text} onChange={this.handleChange}/>
			)
	}
}
export default TCSEditor;