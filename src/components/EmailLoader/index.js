import React, {Component} from 'react';
import {withAuthentication} from '../Session';
import * as ROUTES from '../../constants/routes';


class EmailLoader extends Component {
	constructor(props){
		super(props);
		this.state = {
			
			loaded:false,
			authUser:null,
			emails:[]
		}
		
	}
	componentDidMount(){
		const {label} = this.props;
		fetch(ROUTES.GMAIL_WEBSERVICE + '?label=' + label)
			.then(response => {
				if(response.status === 200){
					response.json()
						.then(data=>{
							this.setState({emails:data,loaded:true});		
						})
					
				}
			})
			.catch(err => {
				console.log(err);
			})
		
	}
	

	render(){
		const {loaded, emails} = this.state;


		return (
			<div id='emailloader'>
				{loaded && emails.length > 0 && (
					<ul>

						{emails.map(email=>(
							<li>
								<h3 className={'email-subject'}>{email.Title}</h3>
								<h4 className={'email-date'}>{email.Date}</h4>
								<div className={'email-body'} dangerouslySetInnerHTML={{__html:email.Body}}/>
							</li>
						))}
					</ul>

				)}
				{!loaded && (
					<img src='/images/loading.gif' />
				)}
				

					
				
				
				
				
				
			</div>
		)
	}
}

export default withAuthentication(EmailLoader);