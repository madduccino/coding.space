import React, {Component} from 'react';
import {withAuthentication} from '../Session';
import AuthUserContext from '../Session/context';
import './index.css';
import * as ASCII from './ascii.js';

class ApproveProgress extends Component {
	constructor(props){
		super(props);
		this.state = {
			
			progress:null,
			lines:[],
			loading:true,
			updated:false,
		}
		this.overlayOnClick = this.overlayOnClick.bind(this);
		
	}
	componentDidMount(){
		
		
	 	const {user,untutorial} = this.props.match.params;
	 	const {lines} = this.state;
	 	if(!!user && !!untutorial){
	 		lines.push({html:'Please log in...',type:false,field:false});
	 		this.setState({lines:lines},()=>{
	 			this.props.firebase.profile(user).on('value', snapshot => {
			 		const user = snapshot.val();
					lines.push({html:'Username:',type:false,field:true});
			 		
	 				this.setState({
	 					user:user,
			 			progress: user.progress[untutorial],
			 			lines:lines,
			 		
			 			loading:false,
			 		})
	 			})
	 		})
	 		
		 		
	 	}
 		
 		

		
		
		
	}
	
	overlayOnClick(){
		const {updated,loading} = this.state;
		if(updated && !loading){
			document.querySelector('#approvewindow').remove();
		}
			
		//document.querySelector('#overlay').style.display = 'none';
		
	}

	render(){
		const {user,progress,lines} = this.state;

		//choose random ASCII art
		const arts = Object.values(ASCII);
		const rArt = arts[Math.floor(Math.random()*arts.length)];


		return (
			
			<iframe id="approvewindow" referrerpolicy='no-referrer' ref={(approvewindow) => { this.approvewindow = approvewindow; }}  className={'crt'} onClick={this.overlayOnClick} onKeyDown={this.overlayOnClick} tabIndex="0">
				<pre dangerouslySetInnerHTML={{__html:rArt}}/>
				<br/>
				<br/>
				<table>
					{lines.map(message=>(
						<tr>
							<td className={'line-marker'}>$<span className={'orange'}>@</span>{user.Username}::></td>
							<td className={'line ' + (message.type ? 'type' : '')} dangerouslySetInnerHTML={{__html:message.html}}/>
						</tr>
					))}
				</table>
			</iframe>
				

			
		)
	}
}

export default withAuthentication(MessageOverlay);