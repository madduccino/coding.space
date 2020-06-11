import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';


class LaunchPad extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:false,
 		untutorials: [],
 	}
 	//console.log("hiya");

 }
 
 handleMouseEnter = () => this.props.setGlobalState({showFooter:false});
	/*$('#scratch-box').fadeIn(250);
	$('#footer').css('display','none');*/
 handleMouseLeave = () => this.props.setGlobalState({showFooter:true})
 componentDidMount(){
 	this.setState({ loading: true });

 	this.props.firebase.untutorials().on('value', snapshot => {
 		const untutsObj = snapshot.val();
 		const untutorials = Object.keys(untutsObj).map(key =>({
 			...untutsObj[key],
 			pid:key,
 		}))
 		this.setState({
 			untutorials: untutorials,
 			loading:false,
 		})
 	})
 	
 }
 componentWillUnmount(){
 	this.props.firebase.untutorials().off();
 }
 render(){
 	
 	const {untutorials, loading} = this.state;


 	//console.log("hiya")
 	return (
		<div>
			<div style={{padding:30 + 'px',marginLeft:0 + 'px',marginRight:0 + 'px',textAlign:'center'}}>
			   <h1>Launch Pad</h1>
			</div>
			<a target="_blank" href="http://scratch.mit.edu/create">
				<button id="go-to-scratch" class="btn btn-success">
					Go to Scratch
				</button>
			</a>
			
			<div id="level1" class="level-container">

			   <h2>Level 1</h2>
			   <div class="level">
				    {loading && <div>Loading ...</div>}
					{untutorials.filter(untutorial=>untutorial.Status === 'APPROVED').map(untutorial => (
						
						<div id={untutorial.key} class={'wsite-image wsite-image-border-none untutorial'}>
							<a href={ROUTES.LAUNCHPAD + '/' + untutorial.key} path={'/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename)}/>
							</a>
							<div>
								<h4 dangerouslySetInnerHTML={{__html:untutorial.Title}}/>
							</div>
						</div>
					))}
			   </div>
			</div>

		</div>

	)
}
}
export default withFirebase(LaunchPad);