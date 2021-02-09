import React from 'react';

import {withFirebase} from '../Firebase';

class LazyLink extends React.Component{
	constructor(props){
		super(props);

		//generate guid
		var guid = 'imgxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g,
				function(c) {
    				var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    				return v.toString(16);
    			})

		this.state = {
			loading: true,
			url: '',	
			guid: guid

		}
	}
	componentDidMount(){
		
		this.props.file.getDownloadURL()
			.then(url=>{
				this.setState({loading:false,url:url}) ;
			})
	}
	componentWillReceiveProps(){
		/*this.props.file.getDownloadURL()
			.then(url=>{
				this.state({loading:false,url:url}) ;
			})*/
	}


	render(){
		const {guid,url} = this.state;
		const {className,Text} = this.props;
		return (
			<a key={guid} className={className} id={guid} href={url}>{Text}</a>
		)
	}
}

export default withFirebase(LazyLink);