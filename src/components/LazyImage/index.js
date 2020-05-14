import React from 'react';

import {withFirebase} from '../Firebase';

class LazyImage extends React.Component{
	constructor(props){
		super(props);

		//generate guid
		var guid = 'imgxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g,
				function(c) {
    				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    				return v.toString(16);
    			})

		this.state = {
			loaded: false,
			url: '/images/loading.gif',	
			guid: guid

		}
	}
	componentDidMount(){
		
		this.props.file.getDownloadURL()
			.then(url=>{
				document.querySelector('#' + this.state.guid).src = url;
			})
	}

	render(){
		const {guid} = this.state;
		return (
			<img className={'project-image'} id={guid} src={'/images/loading.gif'}/>
		)
	}
}

export default withFirebase(LazyImage);